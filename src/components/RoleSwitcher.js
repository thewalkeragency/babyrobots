import { useState } from 'react';
import { ChevronDown, Music, Headphones, Film, Settings, Scale, Users } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ROLES, getRoleById } from '@/lib/roles';
import { cn } from '@/lib/utils';

const roleIcons = {
  artist: Music,
  fan: Headphones,
  licensor: Film,
  provider: Settings,
  legal: Scale,
  general: Users,
};

const roleColors = {
  artist: 'bg-artist',
  fan: 'bg-fan',
  licensor: 'bg-licensor',
  provider: 'bg-provider',
  legal: 'bg-legal',
  general: 'bg-general',
};

export default function RoleSwitcher({ currentRole, onRoleChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const currentRoleInfo = getRoleById(currentRole);
  const CurrentIcon = roleIcons[currentRole] || Users;
  
  return (
    <div className="relative">
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "flex items-center gap-3 p-3 h-auto min-w-[200px] justify-start",
              "hover:bg-accent/50 transition-all duration-200",
              "border-2 border-border hover:border-primary/20"
            )}
          >
            <Avatar className="h-8 w-8">
              <AvatarFallback className={cn("text-white", roleColors[currentRole])}>
                <CurrentIcon className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 text-left">
              <div className="font-medium text-sm">{currentRoleInfo.name}</div>
              <div className="text-xs text-muted-foreground truncate">
                {currentRoleInfo.description}
              </div>
            </div>
            <ChevronDown className={cn(
              "h-4 w-4 transition-transform duration-200",
              isOpen && "rotate-180"
            )} />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent 
          className="w-[280px] p-2" 
          align="start"
          sideOffset={8}
        >
          <DropdownMenuLabel className="text-sm font-semibold text-muted-foreground">
            Switch AI Assistant
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <div className="space-y-1">
            {Object.values(ROLES).map((role) => {
              const Icon = roleIcons[role.id] || Users;
              const isActive = role.id === currentRole;
              
              return (
                <DropdownMenuItem
                  key={role.id}
                  onClick={() => {
                    onRoleChange(role.id);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg cursor-pointer",
                    "hover:bg-accent/50 transition-all duration-200",
                    isActive && "bg-accent/30 border border-primary/20"
                  )}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className={cn("text-white", roleColors[role.id])}>
                      <Icon className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{role.name}</div>
                    <div className="text-xs text-muted-foreground line-clamp-1">
                      {role.description}
                    </div>
                  </div>
                  {isActive && (
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                  )}
                </DropdownMenuItem>
              );
            })}
          </div>
          
          <DropdownMenuSeparator />
          
          <div className="p-2">
            <Card className="border-0 bg-gradient-to-r from-primary/10 via-primary/5 to-background">
              <CardContent className="p-3">
                <div className="text-xs text-muted-foreground">
                  <div className="font-medium mb-1">Current Expertise:</div>
                  <div className="flex flex-wrap gap-1">
                    {currentRoleInfo.expertise.slice(0, 3).map((skill, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-primary/10 rounded text-[10px] font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                    {currentRoleInfo.expertise.length > 3 && (
                      <span className="px-2 py-1 bg-muted/50 rounded text-[10px]">
                        +{currentRoleInfo.expertise.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
