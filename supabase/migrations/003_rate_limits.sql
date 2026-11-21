-- ============================================================================
-- Supabase CMS & Security Migration for Velavan Catering Services
-- Migration: 003_rate_limits.sql
-- Description: Server-side rate limiting table, security policies, and hardened atomic RPCs
-- ============================================================================

-- 1. RATE LIMITS TABLE
CREATE TABLE IF NOT EXISTS public.rate_limits (
  key TEXT PRIMARY KEY,
  points INT NOT NULL DEFAULT 1,
  expire_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT pg_catalog.timezone('utc'::pg_catalog.text, pg_catalog.now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT pg_catalog.timezone('utc'::pg_catalog.text, pg_catalog.now()) NOT NULL
);

-- 2. CREATE INDEX FOR EXPIRATION CLEANUP
CREATE INDEX IF NOT EXISTS idx_rate_limits_expire ON public.rate_limits (expire_at);

-- 3. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- 4. REVOKE ALL PRIVILEGES FROM PUBLIC, ANON, AND AUTHENTICATED
REVOKE ALL ON TABLE public.rate_limits FROM PUBLIC, anon, authenticated;

-- 5. GRANT PRIVILEGES EXCLUSIVELY TO SERVICE_ROLE (Server-side API handlers only)
GRANT ALL ON TABLE public.rate_limits TO service_role;

-- 6. ATOMIC RATE-LIMIT CONSUMPTION & CHECK
-- Consumes 1 attempt atomically and evaluates threshold in a single statement.
-- Hardened with SECURITY DEFINER and SET search_path = '' to eliminate Search Path Hijacking.
CREATE OR REPLACE FUNCTION public.increment_rate_limit(
  p_key TEXT,
  p_window_seconds INT,
  p_max_points INT
)
RETURNS TABLE (
  allowed BOOLEAN,
  current_points INT,
  remaining INT,
  retry_after_seconds INT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_now TIMESTAMPTZ := pg_catalog.timezone('utc'::pg_catalog.text, pg_catalog.now());
  v_record public.rate_limits%ROWTYPE;
  v_retry_after INT := 0;
BEGIN
  -- Strict input validation
  IF p_key IS NULL OR pg_catalog.length(p_key) < 1 OR pg_catalog.length(p_key) > 128 THEN
    RAISE EXCEPTION 'Invalid rate limit key: must be non-empty and <= 128 characters';
  END IF;

  IF p_window_seconds IS NULL OR p_window_seconds < 1 OR p_window_seconds > 86400 THEN
    RAISE EXCEPTION 'Invalid window seconds: must be between 1 and 86400 (24 hours)';
  END IF;

  IF p_max_points IS NULL OR p_max_points < 1 OR p_max_points > 10000 THEN
    RAISE EXCEPTION 'Invalid max points: must be between 1 and 10000';
  END IF;

  -- Bounded opportunistic cleanup: 5% probability per call, deletes up to 100 expired rows
  IF pg_catalog.random() < 0.05 THEN
    DELETE FROM public.rate_limits
    WHERE key IN (
      SELECT key FROM public.rate_limits
      WHERE expire_at <= v_now
      LIMIT 100
    );
  END IF;

  -- Atomic upsert with PostgreSQL row-level lock
  INSERT INTO public.rate_limits (key, points, expire_at, created_at, updated_at)
  VALUES (
    p_key,
    1,
    v_now + (p_window_seconds::pg_catalog.text || ' seconds')::pg_catalog.interval,
    v_now,
    v_now
  )
  ON CONFLICT (key) DO UPDATE
  SET
    points = CASE
      -- If previous window has elapsed, reset counter to 1
      WHEN public.rate_limits.expire_at <= v_now THEN 1
      -- Otherwise increment counter atomically
      ELSE public.rate_limits.points + 1
    END,
    expire_at = CASE
      -- If previous window has elapsed, establish new expiration window
      WHEN public.rate_limits.expire_at <= v_now THEN v_now + (p_window_seconds::pg_catalog.text || ' seconds')::pg_catalog.interval
      -- Otherwise maintain existing window
      ELSE public.rate_limits.expire_at
    END,
    updated_at = v_now
  RETURNING * INTO v_record;

  IF v_record.points > p_max_points THEN
    v_retry_after := pg_catalog.greatest(1, EXTRACT(EPOCH FROM (v_record.expire_at - v_now))::INT);
    RETURN QUERY SELECT FALSE, v_record.points, 0, v_retry_after;
  ELSE
    RETURN QUERY SELECT TRUE, v_record.points, pg_catalog.greatest(0, p_max_points - v_record.points), 0;
  END IF;
END;
$$;

-- 7. ATOMIC RATE-LIMIT RESET (Deletes counter upon successful authentication)
CREATE OR REPLACE FUNCTION public.reset_rate_limit(
  p_key TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF p_key IS NOT NULL AND pg_catalog.length(p_key) <= 128 THEN
    DELETE FROM public.rate_limits WHERE key = p_key;
  END IF;
END;
$$;

-- 8. BOUNDED CLEANUP OF EXPIRED RATE LIMIT RECORDS
CREATE OR REPLACE FUNCTION public.cleanup_expired_rate_limits(
  p_max_delete INT DEFAULT 500
)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_deleted INT := 0;
  v_now TIMESTAMPTZ := pg_catalog.timezone('utc'::pg_catalog.text, pg_catalog.now());
  v_limit INT := pg_catalog.least(pg_catalog.greatest(1, pg_catalog.coalesce(p_max_delete, 500)), 5000);
BEGIN
  DELETE FROM public.rate_limits
  WHERE key IN (
    SELECT key FROM public.rate_limits
    WHERE expire_at <= v_now
    LIMIT v_limit
  );
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;

-- 9. FUNCTION EXECUTION PRIVILEGES (Revoke from PUBLIC/anon/authenticated, grant strictly to service_role)
REVOKE ALL ON FUNCTION public.increment_rate_limit(TEXT, INT, INT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_rate_limit(TEXT, INT, INT) TO service_role;

REVOKE ALL ON FUNCTION public.reset_rate_limit(TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reset_rate_limit(TEXT) TO service_role;

REVOKE ALL ON FUNCTION public.cleanup_expired_rate_limits(INT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_expired_rate_limits(INT) TO service_role;
