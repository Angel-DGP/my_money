import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Dropdown, Icon, Badge } from '@mymoney/ui';
import { notificationsApi } from '../../../entities/notification/api/notifications.api';
import type { NotificationDto } from '../../../entities/notification/model/notification.types';
import { useSessionStore } from '@entities/session';

export function NotificationBell() {
  const queryClient = useQueryClient();
  
  const token = useSessionStore((s) => s.token);
  
  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationsApi.list,
    enabled: !!token,
    refetchInterval: 30000 // Polling every 30s
  });

  const markAsRead = useMutation({
    mutationFn: notificationsApi.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  const unreadCount = data?.data?.unread_count || 0;
  const items = data?.data?.items || [];

  const handleNotificationClick = (item: NotificationDto) => {
    if (!item.read_at) {
      markAsRead.mutate(item.id);
    }
    // If there's an action_url, we could navigate there.
  };

  const getIconForType = (type: string) => {
    switch(type) {
      case 'ERROR': return { name: 'alert-circle', color: 'text-red-500' };
      case 'WARNING': return { name: 'alert-triangle', color: 'text-yellow-500' };
      case 'SUCCESS': return { name: 'check-circle', color: 'text-emerald-500' };
      case 'INFO': return { name: 'info', color: 'text-blue-500' };
      default: return { name: 'bell', color: 'text-text-secondary' };
    }
  };

  return (
    <Dropdown.Root>
      <Dropdown.Trigger className="relative p-2 rounded-full hover:bg-surface transition-colors">
        <Icon name="bell" size="sm" className="text-text-secondary" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
          </span>
        )}
      </Dropdown.Trigger>
      
      <Dropdown.Content align="start" className="w-80 max-h-96 overflow-y-auto p-0">
        <div className="p-3 border-b border-border-subtle bg-surface/50 backdrop-blur-md sticky top-0 z-10 flex justify-between items-center">
          <h3 className="font-medium text-sm text-text-primary">Notificaciones</h3>
          {unreadCount > 0 && (
            <Badge variant="primary" size="sm">{unreadCount} nuevas</Badge>
          )}
        </div>
        
        {isLoading ? (
          <div className="p-4 text-center text-sm text-text-secondary">Cargando...</div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center justify-center">
            <Icon name="bell" className="text-text-muted mb-2" size="md" />
            <p className="text-sm text-text-secondary">No tienes notificaciones</p>
          </div>
        ) : (
          <div className="flex flex-col py-1">
            {items.map((item: NotificationDto) => {
              const iconProps = getIconForType(item.type);
              const isUnread = !item.read_at;
              return (
                <Dropdown.Item 
                  key={item.id} 
                  className={`p-3 items-start gap-3 rounded-none border-b border-border-subtle last:border-0 ${isUnread ? 'bg-primary-500/5' : ''}`}
                  onClick={() => handleNotificationClick(item)}
                >
                  <div className={`mt-0.5 shrink-0 ${iconProps.color}`}>
                    <Icon name={iconProps.name as React.ComponentProps<typeof Icon>['name']} size="sm" />
                  </div>
                  <div className="flex flex-col gap-1 min-w-0 flex-1">
                    <p className={`text-sm leading-tight ${isUnread ? 'font-medium text-text-primary' : 'text-text-secondary'}`}>
                      {item.title}
                    </p>
                    {item.body && (
                      <p className="text-xs text-text-muted line-clamp-2">
                        {item.body}
                      </p>
                    )}
                    <span className="text-[10px] text-text-muted mt-1">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {isUnread && (
                    <div className="shrink-0 w-2 h-2 rounded-full bg-primary-500 mt-1.5" />
                  )}
                </Dropdown.Item>
              );
            })}
          </div>
        )}
      </Dropdown.Content>
    </Dropdown.Root>
  );
}
