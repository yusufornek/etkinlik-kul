import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsAPI } from "@/lib/api";
import { Settings } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Loader2, Save, Plus, X, Calendar, BookOpen, Send, Users, MessageSquare, Heart } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const iconOptions = [
  { value: "Calendar", label: "Takvim", icon: Calendar },
  { value: "BookOpen", label: "Kitap", icon: BookOpen },
  { value: "Send", label: "Gönder", icon: Send },
  { value: "Users", label: "Kullanıcılar", icon: Users },
  { value: "MessageSquare", label: "Mesaj", icon: MessageSquare },
  { value: "Heart", label: "Kalp", icon: Heart },
];

const AdminSettings = () => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    site_name: "",
    about_content: "",
    contact_email: "",
    contact_phone: "",
    mission: "",
    vision: "",
    faqs: [] as Array<{ question: string; answer: string }>,
    features: [] as Array<{ icon: string; title: string; description: string }>,
    club_info_steps: [] as Array<{ step: number; title: string; description: string }>,
  });

  // Site ayarlarını çek
  const { data: settings, isLoading } = useQuery<Settings>({
    queryKey: ['admin-settings'],
    queryFn: settingsAPI.get,
  });

  // Form verilerini ayarlarla doldur
  useEffect(() => {
    if (settings) {
      setFormData({
        site_name: settings.site_name || "",
        about_content: settings.about_content || "",
        contact_email: settings.contact_email || "",
        contact_phone: settings.contact_phone || "",
        mission: settings.mission || "",
        vision: settings.vision || "",
        faqs: settings.faqs || [],
        features: settings.features || [],
        club_info_steps: settings.club_info_steps || [],
      });
    }
  }, [settings]);

  // Ayarları güncelle
  const updateMutation = useMutation({
    mutationFn: settingsAPI.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      toast({
        title: "Başarılı",
        description: "Site ayarları başarıyla güncellendi.",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Ayarlar güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  // SSS İşlemleri
  const addFaq = () => {
    setFormData({
      ...formData,
      faqs: [...formData.faqs, { question: "", answer: "" }],
    });
  };

  const updateFaq = (index: number, field: 'question' | 'answer', value: string) => {
    const newFaqs = [...formData.faqs];
    newFaqs[index][field] = value;
    setFormData({ ...formData, faqs: newFaqs });
  };

  const removeFaq = (index: number) => {
    const newFaqs = formData.faqs.filter((_, i) => i !== index);
    setFormData({ ...formData, faqs: newFaqs });
  };

  // Özellik İşlemleri
  const addFeature = () => {
    setFormData({
      ...formData,
      features: [...formData.features, { icon: "Calendar", title: "", description: "" }],
    });
  };

  const updateFeature = (index: number, field: keyof typeof formData.features[0], value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index][field] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const removeFeature = (index: number) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData({ ...formData, features: newFeatures });
  };

  // Kulüp Bilgi Adımları İşlemleri
  const addStep = () => {
    const nextStep = formData.club_info_steps.length + 1;
    setFormData({
      ...formData,
      club_info_steps: [...formData.club_info_steps, { step: nextStep, title: "", description: "" }],
    });
  };

  const updateStep = (index: number, field: 'title' | 'description', value: string) => {
    const newSteps = [...formData.club_info_steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setFormData({ ...formData, club_info_steps: newSteps });
  };

  const removeStep = (index: number) => {
    const newSteps = formData.club_info_steps
      .filter((_, i) => i !== index)
      .map((step, i) => ({ ...step, step: i + 1 }));
    setFormData({ ...formData, club_info_steps: newSteps });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Site Ayarları</h1>
        <p className="text-muted-foreground">Site genelinde kullanılan ayarları yönetin</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">Genel</TabsTrigger>
            <TabsTrigger value="about">Hakkında</TabsTrigger>
            <TabsTrigger value="features">Özellikler</TabsTrigger>
            <TabsTrigger value="faqs">SSS</TabsTrigger>
          </TabsList>

          {/* Genel Ayarlar */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Genel Ayarlar</CardTitle>
                <CardDescription>Site başlığı ve iletişim bilgileri</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="site_name">Site Adı</Label>
                  <Input
                    id="site_name"
                    value={formData.site_name}
                    onChange={(e) => setFormData({ ...formData, site_name: e.target.value })}
                    placeholder="İstanbul Üniversitesi Kampüs Etkinlikleri"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="contact_email">İletişim E-posta</Label>
                    <Input
                      id="contact_email"
                      type="email"
                      value={formData.contact_email}
                      onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                      placeholder="etkinlik@istanbul.edu.tr"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact_phone">İletişim Telefon</Label>
                    <Input
                      id="contact_phone"
                      value={formData.contact_phone}
                      onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                      placeholder="+90 212 440 00 00"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Hakkında Sayfası */}
          <TabsContent value="about" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Hakkında Sayfası İçeriği</CardTitle>
                <CardDescription>Hakkında sayfasında gösterilecek içerikler</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="about_content">Hakkında İçeriği</Label>
                  <Textarea
                    id="about_content"
                    value={formData.about_content}
                    onChange={(e) => setFormData({ ...formData, about_content: e.target.value })}
                    rows={10}
                    placeholder="<p>İstanbul Üniversitesi Kampüs Etkinlikleri platformu...</p>"
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    HTML etiketleri kullanabilirsiniz: &lt;p&gt;, &lt;h3&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt;, &lt;em&gt;
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mission">Misyon</Label>
                  <Textarea
                    id="mission"
                    value={formData.mission}
                    onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
                    rows={3}
                    placeholder="Kampüs yaşamını zenginleştirmek..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="vision">Vizyon</Label>
                  <Textarea
                    id="vision"
                    value={formData.vision}
                    onChange={(e) => setFormData({ ...formData, vision: e.target.value })}
                    rows={3}
                    placeholder="Türkiye'nin en aktif kampüsü olmak..."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Kulüp Bilgileri */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Kulüp Bilgi Adımları</CardTitle>
                    <CardDescription>Kulüplerin etkinlik ekleme süreci</CardDescription>
                  </div>
                  <Button type="button" onClick={addStep} size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Adım Ekle
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.club_info_steps.map((step, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium">
                          {step.step}
                        </div>
                        <div className="flex-1 space-y-2">
                          <Input
                            placeholder="Adım başlığı"
                            value={step.title}
                            onChange={(e) => updateStep(index, 'title', e.target.value)}
                          />
                          <Textarea
                            placeholder="Adım açıklaması"
                            value={step.description}
                            onChange={(e) => updateStep(index, 'description', e.target.value)}
                            rows={2}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeStep(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Özellikler */}
          <TabsContent value="features" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Platform Özellikleri</CardTitle>
                    <CardDescription>Hakkında sayfasında gösterilecek özellikler</CardDescription>
                  </div>
                  <Button type="button" onClick={addFeature} size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Özellik Ekle
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.features.map((feature, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="flex-1 space-y-2">
                            <Label>İkon</Label>
                            <Select
                              value={feature.icon}
                              onValueChange={(value) => updateFeature(index, 'icon', value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {iconOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    <div className="flex items-center gap-2">
                                      <option.icon className="h-4 w-4" />
                                      <span>{option.label}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFeature(index)}
                            className="mt-8"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <Input
                          placeholder="Özellik başlığı"
                          value={feature.title}
                          onChange={(e) => updateFeature(index, 'title', e.target.value)}
                        />
                        <Textarea
                          placeholder="Özellik açıklaması"
                          value={feature.description}
                          onChange={(e) => updateFeature(index, 'description', e.target.value)}
                          rows={2}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* SSS */}
          <TabsContent value="faqs" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Sıkça Sorulan Sorular</CardTitle>
                    <CardDescription>Hakkında sayfasında gösterilecek SSS</CardDescription>
                  </div>
                  <Button type="button" onClick={addFaq} size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Soru Ekle
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {formData.faqs.map((faq, index) => (
                  <Card key={index}>
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <Input
                            placeholder="Soru"
                            value={faq.question}
                            onChange={(e) => updateFaq(index, 'question', e.target.value)}
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFaq(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <Textarea
                          placeholder="Cevap"
                          value={faq.answer}
                          onChange={(e) => updateFaq(index, 'answer', e.target.value)}
                          rows={3}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end mt-6">
          <Button 
            type="submit" 
            disabled={updateMutation.isPending}
            className="min-w-[120px]"
          >
            {updateMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Kaydediliyor...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Tüm Ayarları Kaydet
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;
