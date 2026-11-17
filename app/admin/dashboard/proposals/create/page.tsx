'use client'

import React, { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import CateringProposalBuilder from '@/components/admin/CateringProposalBuilder'
import { EnquiryRecord } from '@/lib/cms-store'

function CreateProposalContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const enquiryId = searchParams.get('enquiryId')

  const [enquiry, setEnquiry] = useState<EnquiryRecord | null>(null)
  const [loading, setLoading] = useState(!!enquiryId)

  useEffect(() => {
    if (!enquiryId) return
    async function loadEnquiry() {
      try {
        const res = await fetch(`/api/admin/enquiries?id=${enquiryId}`)
        if (res.ok) {
          const data = await res.json()
          if (data.success && data.enquiry) {
            setEnquiry(data.enquiry)
          }
        }
      } catch (err) {
        console.error('Error loading enquiry:', err)
      } finally {
        setLoading(false)
      }
    }
    loadEnquiry()
  }, [enquiryId])

  const handleClose = () => {
    router.push('/admin/dashboard/proposals')
  }

  const handleSaved = () => {
    router.push('/admin/dashboard/proposals')
  }

  if (loading) {
    return (
      <div
        style={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#153d2d',
          fontSize: '0.9rem',
          fontWeight: 600,
        }}
      >
        Loading customer enquiry details...
      </div>
    )
  }

  return (
    <CateringProposalBuilder
      enquiry={enquiry}
      onClose={handleClose}
      onSaved={handleSaved}
      initialViewMode="build"
    />
  )
}

export default function CreateProposalPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: '60vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#153d2d',
            fontSize: '0.9rem',
            fontWeight: 600,
          }}
        >
          Loading Proposal Builder...
        </div>
      }
    >
      <CreateProposalContent />
    </Suspense>
  )
}
