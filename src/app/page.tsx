import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import Seguros from '@/components/Seguros'
import ComoFunciona from '@/components/ComoFunciona'
import Diferenciais from '@/components/Diferenciais'
import Depoimentos from '@/components/Depoimentos'
import CotacaoForm from '@/components/CotacaoForm'
import Footer from '@/components/Footer'

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Seguros />
      <ComoFunciona />
      <Diferenciais />
      <Depoimentos />
      <CotacaoForm />
      <Footer />
    </main>
  )
}
