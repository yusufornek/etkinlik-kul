import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { storiesAPI } from "@/lib/api";
import { Story } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Edit, Plus, Trash2, Image, Link, Clock, Upload } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { getImageUrl } from "@/lib/utils";

const AdminStories = () => {
  const queryClient = useQueryClient();
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    image_url: "",
    link_url: "",
    order_index: 0,
    expires_at: "",
    is_active: true,
  });

  // Story'leri çek
  const { data: stories = [], isLoading } = useQuery<Story[]>({
    queryKey: ['admin-stories-list'],
    queryFn: () => storiesAPI.getAll(false),
  });

  // Story oluştur
  const createMutation = useMutation({
    mutationFn: storiesAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-stories-list'] });
      queryClient.invalidateQueries({ queryKey: ['stories'] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "Başarılı",
        description: "Story başarıyla oluşturuldu.",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Story oluşturulurken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  // Story güncelle
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => storiesAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-stories-list'] });
      queryClient.invalidateQueries({ queryKey: ['stories'] });
      setIsDialogOpen(false);
      setSelectedStory(null);
      resetForm();
      toast({
        title: "Başarılı",
        description: "Story başarıyla güncellendi.",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Story güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  // Story sil
  const deleteMutation = useMutation({
    mutationFn: storiesAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-stories-list'] });
      queryClient.invalidateQueries({ queryKey: ['stories'] });
      toast({
        title: "Başarılı",
        description: "Story başarıyla silindi.",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Story silinirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  // Süre dolmuş story'leri temizle
  const cleanupExpiredMutation = useMutation({
    mutationFn: storiesAPI.cleanupExpired,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-stories-list'] });
      queryClient.invalidateQueries({ queryKey: ['stories'] });
      toast({
        title: "Başarılı",
        description: "Süre dolmuş story'ler temizlendi.",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Temizleme sırasında bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      image_url: "",
      link_url: "",
      order_index: 0,
      expires_at: "",
      is_active: true,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Eğer expires_at boşsa, 24 saat sonrası olarak ayarla
    const dataToSubmit = {
      ...formData,
      expires_at: formData.expires_at || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };
    
    // image_url geçici olarak boş bırakıyoruz, sonra upload edeceğiz
    if (!selectedStory) {
      dataToSubmit.image_url = "/placeholder.svg";
    }
    
    if (selectedStory) {
      updateMutation.mutate({ id: selectedStory.id, data: dataToSubmit });
    } else {
      createMutation.mutate(dataToSubmit);
    }
  };

  const handleImageUpload = async (storyId: number) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        await storiesAPI.uploadImage(storyId, file);
        queryClient.invalidateQueries({ queryKey: ['admin-stories-list'] });
        queryClient.invalidateQueries({ queryKey: ['stories'] });
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

  const handleEdit = (story: Story) => {
    setSelectedStory(story);
    setFormData({
      title: story.title,
      image_url: story.image_url,
      link_url: story.link_url || "",
      order_index: story.order_index,
      expires_at: new Date(story.expires_at).toISOString().slice(0, 16),
      is_active: story.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Bu story'yi silmek istediğinizden emin misiniz?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Story'ler</h1>
          <p className="text-muted-foreground">Story'leri yönetin</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => cleanupExpiredMutation.mutate()}
          >
            <Clock className="mr-2 h-4 w-4" />
            Süre Dolmuşları Temizle
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setSelectedStory(null);
                resetForm();
              }}>
                <Plus className="mr-2 h-4 w-4" />
                Yeni Story
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{selectedStory ? "Story Düzenle" : "Yeni Story"}</DialogTitle>
                <DialogDescription>
                  {selectedStory ? "Story bilgilerini güncelleyin." : "Yeni bir story oluşturun."}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Başlık</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                
                {!selectedStory && (
                  <div className="bg-muted/50 p-3 rounded-md">
                    <p className="text-sm text-muted-foreground">
                      Story oluşturduktan sonra görsel yükleyebilirsiniz.
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="link_url">Link URL (İsteğe bağlı)</Label>
                  <Input
                    id="link_url"
                    value={formData.link_url}
                    onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                    placeholder="https://example.com"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="order_index">Sıra</Label>
                    <Input
                      id="order_index"
                      type="number"
                      value={formData.order_index}
                      onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) || 0 })}
                      min="0"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="expires_at">Bitiş Tarihi</Label>
                    <Input
                      id="expires_at"
                      type="datetime-local"
                      value={formData.expires_at}
                      onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active">Aktif</Label>
                </div>

                <div className="flex justify-end gap-4">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    İptal
                  </Button>
                  <Button type="submit">
                    {selectedStory ? "Güncelle" : "Oluştur"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Story Listesi</CardTitle>
          <CardDescription>Toplam {stories.length} story</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Görsel</TableHead>
                <TableHead>Başlık</TableHead>
                <TableHead>Sıra</TableHead>
                <TableHead>Link</TableHead>
                <TableHead>Bitiş Tarihi</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stories.map((story) => (
                <TableRow key={story.id}>
                  <TableCell>
                    <img 
                      src={getImageUrl(story.image_url)} 
                      alt={story.title}
                      className="w-12 h-16 object-cover rounded"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{story.title}</TableCell>
                  <TableCell>{story.order_index}</TableCell>
                  <TableCell>
                    {story.link_url ? (
                      <a 
                        href={story.link_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-600 hover:underline"
                      >
                        <Link className="h-3 w-3" />
                        Link
                      </a>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(story.expires_at).toLocaleDateString('tr-TR')}
                      <br />
                      {new Date(story.expires_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <Badge variant={story.is_active ? "default" : "secondary"}>
                        {story.is_active ? "Aktif" : "Pasif"}
                      </Badge>
                      {story.is_expired && (
                        <Badge variant="destructive" className="block">
                          Süresi Dolmuş
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleImageUpload(story.id)}
                        title="Görsel Yükle"
                      >
                        <Upload className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(story)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(story.id)}
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

export default AdminStories;
