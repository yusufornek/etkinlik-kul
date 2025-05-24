import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { settingsAPI } from "@/lib/api";
import { Settings } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { 
  Target, 
  Eye, 
  Mail, 
  Phone, 
  MessageSquare, 
  Users, 
  Send,
  HelpCircle,
  Calendar,
  BookOpen,
  Heart
} from "lucide-react";

const About = () => {
  const { data: settings, isLoading } = useQuery({
    queryKey: ['site-settings'],
    queryFn: settingsAPI.get,
  });

  // İkon mapping
  const iconMap: { [key: string]: any } = {
    Calendar,
    BookOpen,
    Send,
    Users,
    MessageSquare,
    Heart
  };

  // Admin'den gelen verileri kullan, yoksa varsayılanları
  const displayFeatures = settings?.features && settings.features.length > 0 
    ? settings.features.map(f => ({
        ...f,
        icon: iconMap[f.icon] || Calendar
      }))
    : features;

  const displayFaqs = settings?.faqs && settings.faqs.length > 0 
    ? settings.faqs 
    : faqs;

  const displaySteps = settings?.club_info_steps && settings.club_info_steps.length > 0
    ? settings.club_info_steps
    : [
        { step: 1, title: "E-posta Gönderin", description: `Etkinlik detaylarını ${settings?.contact_email || "etkinlik@istanbul.edu.tr"} adresine gönderin` },
        { step: 2, title: "Form Doldurun", description: "Online etkinlik başvuru formunu eksiksiz doldurun" },
        { step: 3, title: "Onay Bekleyin", description: "İnceleme sonrası etkinliğiniz platforma eklenir" },
        { step: 4, title: "Duyurun", description: "Etkinliğiniz tüm kampüse duyurulur" }
      ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-primary/10 to-background py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-display font-bold mb-4 animate-fade-in">
            Hakkımızda
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in-delay-1">
            {settings?.site_name || "İstanbul Üniversitesi Kampüs Etkinlikleri"}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Ana İçerik */}
        <Card className="mb-12 border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardContent className="p-8">
            <div className="prose prose-lg dark:prose-invert max-w-none">
              {isLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : (
                <div dangerouslySetInnerHTML={{ __html: settings?.about_content || defaultAboutContent }} />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Misyon & Vizyon - Hover efektli kartlar */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <Card className="group hover:scale-105 transition-all duration-300 border-none shadow-lg hover:shadow-xl cursor-pointer">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full w-fit group-hover:bg-primary/20 transition-colors">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Misyonumuz</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center">
                {settings?.mission || "Kampüs yaşamını zenginleştirmek ve öğrencilerin sosyal, kültürel ve akademik gelişimlerine katkıda bulunmak."}
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:scale-105 transition-all duration-300 border-none shadow-lg hover:shadow-xl cursor-pointer">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full w-fit group-hover:bg-primary/20 transition-colors">
                <Eye className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Vizyonumuz</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center">
                {settings?.vision || "Türkiye'nin en aktif ve katılımcı üniversite kampüsü olmak."}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Özellikler */}
        {displayFeatures.length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl font-display font-semibold mb-8 text-center">Platform Özellikleri</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {displayFeatures.map((feature, index) => (
                <Card 
                  key={index} 
                  className="group hover:scale-105 transition-all duration-300 border-none shadow-lg hover:shadow-xl cursor-pointer"
                >
                  <CardHeader className="text-center">
                    <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit group-hover:bg-primary/20 transition-colors">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-center text-sm">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Sıkça Sorulan Sorular */}
        {displayFaqs.length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl font-display font-semibold mb-8 text-center">Sıkça Sorulan Sorular</h2>
            <Accordion type="single" collapsible className="space-y-4">
              {displayFaqs.map((faq, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`} 
                  className="border rounded-lg px-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3 text-left">
                      <HelpCircle className="h-5 w-5 text-primary flex-shrink-0" />
                      <span className="font-medium">{faq.question}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        )}

        {/* Kulüpler İçin Bilgi */}
        {displaySteps.length > 0 && (
          <Card className="mb-12 bg-primary/5 border-primary/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6 text-primary" />
                <CardTitle className="text-2xl">Öğrenci Kulüpleri İçin</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Kulübünüzün etkinliklerini platforma eklemek ve daha geniş kitlelere ulaşmak mı istiyorsunuz?
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {displaySteps.map((step) => (
                  <div key={step.step} className="flex items-start gap-3">
                    <Badge className="mt-1">{step.step}</Badge>
                    <div>
                      <p className="font-medium">{step.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* İletişim */}
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl text-center">İletişim</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <a 
                href={`mailto:${settings?.contact_email || "etkinlik@istanbul.edu.tr"}`}
                className="flex items-center gap-3 p-4 rounded-lg hover:bg-accent transition-colors group"
              >
                <Mail className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                <span className="text-muted-foreground">
                  {settings?.contact_email || "etkinlik@istanbul.edu.tr"}
                </span>
              </a>
              <a 
                href={`tel:${settings?.contact_phone || "+902124400000"}`}
                className="flex items-center gap-3 p-4 rounded-lg hover:bg-accent transition-colors group"
              >
                <Phone className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                <span className="text-muted-foreground">
                  {settings?.contact_phone || "+90 212 440 00 00"}
                </span>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const features = [
  {
    icon: Calendar,
    title: "Etkinlik Takvimi",
    description: "Tüm kampüs etkinliklerini tek bir takvimde görüntüleyin"
  },
  {
    icon: BookOpen,
    title: "Kategorik Arama",
    description: "İlgi alanlarınıza göre etkinlikleri filtreleyin"
  },
  {
    icon: Send,
    title: "Online Kayıt",
    description: "Etkinliklere hızlı ve kolay online kayıt olun"
  },
  {
    icon: Users,
    title: "Kulüp Etkinlikleri",
    description: "Öğrenci kulüplerinin etkinliklerini keşfedin"
  },
  {
    icon: MessageSquare,
    title: "Story Güncellemeleri",
    description: "Anlık duyuruları story formatında takip edin"
  },
  {
    icon: Heart,
    title: "Favori Etkinlikler",
    description: "İlginizi çeken etkinlikleri kaydedin"
  }
];

const faqs = [
  {
    question: "Platform ücretsiz mi?",
    answer: "Evet, İstanbul Üniversitesi Kampüs Etkinlikleri platformu tüm öğrenci, akademisyen ve çalışanlarımız için tamamen ücretsizdir."
  },
  {
    question: "Etkinliklere nasıl kayıt olabilirim?",
    answer: "Kayıt gerektiren etkinliklerin detay sayfasında 'Kayıt Ol' butonu bulunur. Bu butona tıklayarak online kayıt formuna yönlendirilirsiniz."
  },
  {
    question: "Kendi etkinliğimi nasıl ekleyebilirim?",
    answer: "Öğrenci kulüpleri ve birimler, etkinlik detaylarını etkinlik@istanbul.edu.tr adresine göndererek platformda yer alabilirler. İnceleme sonrası etkinliğiniz yayınlanır."
  },
  {
    question: "Story'ler ne kadar süre görünür?",
    answer: "Story'ler genellikle 24 saat boyunca aktif kalır. Özel duyurular için bu süre uzatılabilir."
  },
  {
    question: "Etkinlik iptal edilirse bilgilendirilir miyim?",
    answer: "Kayıtlı olduğunuz etkinlikler iptal edilirse veya değişiklik olursa e-posta ile bilgilendirilirsiniz."
  },
  {
    question: "Mobil uygulama var mı?",
    answer: "Şu anda mobil uygulamamız bulunmamakta, ancak web sitemiz mobil cihazlara uyumlu olarak tasarlanmıştır."
  }
];

const defaultAboutContent = `
<p>İstanbul Üniversitesi Kampüs Etkinlikleri platformu, üniversitemizin zengin kampüs yaşamını dijital ortama taşıyan modern bir etkinlik yönetim sistemidir.</p>

<h3>Neler Sunuyoruz?</h3>
<ul>
  <li>Kampüsteki tüm etkinlikleri tek bir platformda topluyoruz</li>
  <li>Konferans, seminer, workshop ve sosyal etkinlikleri kolayca keşfedebilirsiniz</li>
  <li>İlgi alanlarınıza göre etkinlikleri filtreleyebilirsiniz</li>
  <li>Etkinliklere online kayıt olabilirsiniz</li>
  <li>Güncel duyuruları story formatında takip edebilirsiniz</li>
</ul>

<h3>Kimler İçin?</h3>
<p>Bu platform, İstanbul Üniversitesi'nin tüm öğrencileri, akademisyenleri ve çalışanları için tasarlanmıştır. Amacımız, kampüs yaşamını daha erişilebilir ve katılımcı hale getirmektir.</p>
`;

export default About;
