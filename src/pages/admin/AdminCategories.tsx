import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { categoriesAPI } from "@/lib/api";
import { Category } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Edit, Plus, Trash2, Palette } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const AdminCategories = () => {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    color_class: "",
    text_color_class: "",
    icon: "",
    description: "",
    is_active: true,
  });

  // Kategorileri çek
  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ['admin-categories-list'],
    queryFn: () => categoriesAPI.getAll(false),
  });

  // Kategori oluştur
  const createMutation = useMutation({
    mutationFn: categoriesAPI.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories-list'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setIsDialogOpen(false);
      resetForm();
      toast({
        title: "Başarılı",
        description: "Kategori başarıyla oluşturuldu.",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Kategori oluşturulurken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  // Kategori güncelle
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => categoriesAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories-list'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setIsDialogOpen(false);
      setSelectedCategory(null);
      resetForm();
      toast({
        title: "Başarılı",
        description: "Kategori başarıyla güncellendi.",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Kategori güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  // Kategori sil
  const deleteMutation = useMutation({
    mutationFn: categoriesAPI.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories-list'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({
        title: "Başarılı",
        description: "Kategori başarıyla silindi.",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Kategori silinirken bir hata oluştu.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      color_class: "",
      text_color_class: "",
      icon: "",
      description: "",
      is_active: true,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const dataToSubmit = {
      ...formData,
      slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
    };
    
    if (selectedCategory) {
      updateMutation.mutate({ id: selectedCategory.id, data: dataToSubmit });
    } else {
      createMutation.mutate(dataToSubmit);
    }
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      color_class: category.color_class,
      text_color_class: category.text_color_class,
      icon: category.icon || "",
      description: category.description || "",
      is_active: category.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Bu kategoriyi silmek istediğinizden emin misiniz?")) {
      deleteMutation.mutate(id);
    }
  };

  const colorOptions = [
    { label: "Mavi", bg: "bg-soft-blue", text: "text-vivid-blue" },
    { label: "Yeşil", bg: "bg-soft-green", text: "text-green-700" },
    { label: "Pembe", bg: "bg-soft-pink", text: "text-vivid-purple" },
    { label: "Sarı", bg: "bg-amber-100", text: "text-amber-800" },
    { label: "Mor", bg: "bg-purple-100", text: "text-vivid-purple" },
  ];

  if (isLoading) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Kategoriler</h1>
          <p className="text-muted-foreground">Etkinlik kategorilerini yönetin</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setSelectedCategory(null);
              resetForm();
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Yeni Kategori
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedCategory ? "Kategori Düzenle" : "Yeni Kategori"}</DialogTitle>
              <DialogDescription>
                {selectedCategory ? "Kategori bilgilerini güncelleyin." : "Yeni bir kategori oluşturun."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Kategori Adı</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="slug">Slug (URL)</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="Otomatik oluşturulur"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="icon">İkon (İsteğe bağlı)</Label>
                <Input
                  id="icon"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  placeholder="Örn: calendar, book, music"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Açıklama (İsteğe bağlı)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Renk Seçimi</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="color_class">Arkaplan Rengi</Label>
                    <Input
                      id="color_class"
                      value={formData.color_class}
                      onChange={(e) => setFormData({ ...formData, color_class: e.target.value })}
                      placeholder="bg-soft-blue"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="text_color_class">Yazı Rengi</Label>
                    <Input
                      id="text_color_class"
                      value={formData.text_color_class}
                      onChange={(e) => setFormData({ ...formData, text_color_class: e.target.value })}
                      placeholder="text-vivid-blue"
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  {colorOptions.map((color) => (
                    <Button
                      key={color.label}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFormData({ 
                        ...formData, 
                        color_class: color.bg, 
                        text_color_class: color.text 
                      })}
                      className={`${color.bg} ${color.text}`}
                    >
                      {color.label}
                    </Button>
                  ))}
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
                  {selectedCategory ? "Güncelle" : "Oluştur"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Kategori Listesi</CardTitle>
          <CardDescription>Toplam {categories.length} kategori</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kategori</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Açıklama</TableHead>
                <TableHead>Renk</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {category.icon && <span>{category.icon}</span>}
                      {category.name}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{category.slug}</TableCell>
                  <TableCell>
                    {category.description ? (
                      <span className="text-sm text-muted-foreground">{category.description}</span>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={`${category.color_class} ${category.text_color_class}`}>
                      Örnek
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={category.is_active ? "default" : "secondary"}>
                      {category.is_active ? "Aktif" : "Pasif"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(category)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(category.id)}
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

export default AdminCategories;
