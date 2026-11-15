import { Hero } from '@/components/sections/Hero'
import { PromiseStrip } from '@/components/sections/PromiseStrip'
import { Story } from '@/components/sections/Story'
import { Tribute } from '@/components/sections/Tribute'
import { Values } from '@/components/sections/Values'
import { Services } from '@/components/sections/Services'
import { Clients } from '@/components/sections/Clients'
import { MenuSection } from '@/components/sections/MenuSection'
import { Gallery } from '@/components/sections/Gallery'
import { Enquiry } from '@/components/sections/Enquiry'
import { Registrations } from '@/components/sections/Registrations'

export default function HomePage() {
  return (
    <main>
      <Hero />
      <PromiseStrip />
      <Story />
      <Tribute />
      <Values />
      <Services />
      <Clients />
      <MenuSection />
      <Gallery />
      <Enquiry />
      <Registrations />
    </main>
  )
}
