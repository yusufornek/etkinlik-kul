import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, FolderOpen, Image, TrendingUp } from "lucide-react";
import { eventsAPI, categoriesAPI, storiesAPI } from "@/lib/api";
import { Event, Category, Story } from "@/types";

const AdminDashboard = () => {
  const { data: events = [] } = useQuery<Event[]>({
    queryKey: ['admin-events'],
    queryFn: () => eventsAPI.getAll({ active_only: false }),
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['admin-categories'],
    queryFn: () => categoriesAPI.getAll(false),
  });

  const { data: stories = [] } = useQuery<Story[]>({
    queryKey: ['admin-stories'],
    queryFn: () => storiesAPI.getAll(false),
  });

  // İstatistikler
  const activeEvents = events.filter(e => e.is_active).length;
  const upcomingEvents = events.filter(e => {
    const eventDate = new Date(e.date);
    return eventDate >= new Date() && e.is_active;
  }).length;
  const activeCategories = categories.filter(c => c.is_active).length;
  const activeStories = stories.filter(s => s.is_active && !s.is_expired).length;

  const stats = [
    {
      title: "Toplam Etkinlik",
      value: events.length,
      icon: Calendar,
      description: `${activeEvents} aktif, ${upcomingEvents} yaklaşan`,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Kategoriler",
      value: categories.length,
      icon: FolderOpen,
      description: `${activeCategories} aktif kategori`,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Storyler",
      value: stories.length,
      icon: Image,
      description: `${activeStories} aktif story`,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Bu Ay Etkinlik",
      value: events.filter(e => {
        const eventDate = new Date(e.date);
        const now = new Date();
        return eventDate.getMonth() === now.getMonth() && 
               eventDate.getFullYear() === now.getFullYear();
      }).length,
      icon: TrendingUp,
      description: "Bu ay içindeki etkinlikler",
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

  // Yaklaşan etkinlikler
  const upcomingEventsList = events
    .filter(e => {
      const eventDate = new Date(e.date);
      return eventDate >= new Date() && e.is_active;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Kampüs etkinlikleri yönetim paneli</p>
      </div>

      {/* İstatistik Kartları */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Yaklaşan Etkinlikler */}
      <Card>
        <CardHeader>
          <CardTitle>Yaklaşan Etkinlikler</CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingEventsList.length > 0 ? (
            <div className="space-y-4">
              {upcomingEventsList.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{event.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(event.date).toLocaleDateString('tr-TR')} - {event.time}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${event.category.color_class} ${event.category.text_color_class}`}>
                    {event.category.name}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">Yaklaşan etkinlik bulunmuyor.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
