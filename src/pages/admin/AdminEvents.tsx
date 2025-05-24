import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { eventsAPI, categoriesAPI } from "@/lib/api";
import { Event, Category } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Edit, MapPin, Plus, Trash2, Upload, Image } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { getImageUrl } from "@/lib/utils";

const AdminEvents = () => {
  const queryClient = useQueryClient();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    organizer: "",
    category_id: 0,
    latitude: null as number | null,
    longitude: null as number | null,
    address: "",
    requires_registration: false,
    registration_link: "",
    is_active: true,
    is_featured: false,
  });

  // Etkinlikleri çek
  const { data: events = [], isLoading } = useQuery<Event[]>({
    queryKey: ['admin-events-list'],
    queryFn: () => eventsAPI.getAll({ active_only: false }),
  });

  // Kategorileri çek
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories-for-events'],
    queryFn: () => categoriesAPI.getAll(false),
  });

  // Etkinlik oluştur
  const createMutation = useMutation({
    mutationFn: eventsAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-events-list'] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "Başarılı",
        description: "Etkinlik başarıyla oluşturuldu.",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Etkinlik oluşturulurken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  // Etkinlik güncelle
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => eventsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-events-list'] });
      setIsDialogOpen(false);
      setSelectedEvent(null);
      resetForm();
      toast({
        title: "Başarılı",
        description: "Etkinlik başarıyla güncellendi.",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Etkinlik güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  // Etkinlik sil
  const deleteMutation = useMutation({
    mutationFn: eventsAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-events-list'] });
      toast({
        title: "Başarılı",
        description: "Etkinlik başarıyla silindi.",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Etkinlik silinirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      date: "",
      time: "",
      location: "",
      organizer: "",
      category_id: 0,
      latitude: null,
      longitude: null,
      address: "",
      requires_registration: false,
      registration_link: "",
      is_active: true,
      is_featured: false,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedEvent) {
      updateMutation.mutate({ id: selectedEvent.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (event: Event) => {
    setSelectedEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location,
      organizer: event.organizer,
      category_id: event.category_id,
      latitude: event.latitude,
      longitude: event.longitude,
      address: event.address || "",
      requires_registration: event.requires_registration,
      registration_link: event.registration_link || "",
      is_active: event.is_active,
      is_featured: event.is_featured,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Bu etkinliği silmek istediğinizden emin misiniz?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleToggleFeatured = async (event: Event) => {
    try {
      await eventsAPI.update(event.id, { ...event, is_featured: !event.is_featured });
      queryClient.invalidateQueries({ queryKey: ['admin-events-list'] });
      toast({
        title: "Başarılı",
        description: `Etkinlik ${!event.is_featured ? "öne çıkarıldı" : "öne çıkarılmaktan kaldırıldı"}.`,
      });
    } catch (error) {
      toast({
        title: "Hata",
        description: "İşlem sırasında bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const handleImageUpload = async (eventId: number) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        await eventsAPI.uploadImage(eventId, file);
        queryClient.invalidateQueries({ queryKey: ['admin-events-list'] });
        toast({
          title: "Başarılı",
          description: "Görsel başarıyla yüklendi.",
        });
      } catch (error) {
        toast({
          title: "Hata",
          description: "Görsel yüklenirken bir hata oluştu.",
          variant: "destructive",
        });
      }
    };
    
    input.click();
  };

  if (isLoading) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Etkinlikler</h1>
          <p className="text-muted-foreground">Etkinlikleri yönetin</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setSelectedEvent(null);
              resetForm();
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Yeni Etkinlik
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedEvent ? "Etkinlik Düzenle" : "Yeni Etkinlik"}</DialogTitle>
              <DialogDescription>
                {selectedEvent ? "Etkinlik bilgilerini güncelleyin." : "Yeni bir etkinlik oluşturun."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Başlık</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Kategori</Label>
                  <Select
                    value={String(formData.category_id)}
                    onValueChange={(value) => setFormData({ ...formData, category_id: Number(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Kategori seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={String(category.id)}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Açıklama</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Tarih</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="time">Saat</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Konum</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="organizer">Düzenleyen</Label>
                  <Input
                    id="organizer"
                    value={formData.organizer}
                    onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Adres (İsteğe bağlı)</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div className="space-y-4 border-t pt-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="requires_registration"
                    checked={formData.requires_registration}
                    onCheckedChange={(checked) => setFormData({ ...formData, requires_registration: checked })}
                  />
                  <Label htmlFor="requires_registration">Kayıt Gerekli</Label>
                </div>
                
                {formData.requires_registration && (
                  <div className="space-y-2">
                    <Label htmlFor="registration_link">Kayıt Linki</Label>
                    <Input
                      id="registration_link"
                      type="url"
                      value={formData.registration_link}
                      onChange={(e) => setFormData({ ...formData, registration_link: e.target.value })}
                      placeholder="https://form.example.com"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active">Aktif</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                  />
                  <Label htmlFor="is_featured">Öne Çıkar</Label>
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  İptal
                </Button>
                <Button type="submit">
                  {selectedEvent ? "Güncelle" : "Oluştur"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Etkinlik Listesi</CardTitle>
          <CardDescription>Toplam {events.length} etkinlik</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Görsel</TableHead>
                <TableHead>Başlık</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Tarih</TableHead>
                <TableHead>Konum</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead>Öne Çıkan</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((event) => (
                <TableRow key={event.id}>
                  <TableCell>
                    <img 
                      src={getImageUrl(event.image_url)} 
                      alt={event.title}
                      className="w-16 h-12 object-cover rounded"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{event.title}</TableCell>
                  <TableCell>
                    <Badge className={`${event.category.color_class} ${event.category.text_color_class}`}>
                      {event.category.name}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4" />
                      {new Date(event.date).toLocaleDateString('tr-TR')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4" />
                      {event.location}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={event.is_active ? "default" : "secondary"}>
                      {event.is_active ? "Aktif" : "Pasif"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={event.is_featured}
                      onCheckedChange={() => handleToggleFeatured(event)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleImageUpload(event.id)}
                        title="Görsel Yükle"
                      >
                        <Image className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(event)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(event.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminEvents;
