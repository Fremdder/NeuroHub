"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

import { Brain } from "lucide-react";
import { Bot, CreditCard, LayoutDashboard, Presentation } from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button  } from "@/components/ui/button";
import { useEffect, useState } from "react";
import useProject from "@/hooks/use-project";

const appcontent = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Q&A", url: "/qna", icon: Bot },
  { title: "Meeting", url: "/meeting", icon: Presentation },
  { title: "Premium", url: "/premium", icon: CreditCard },
];


export function AppSidebar() {
  const pathname = usePathname()
  const {open} = useSidebar()
  const [isMounted, setIsMounted] = useState(false)
  const {projects,projectId,setProjectId} = useProject()

    useEffect(() => {
    setIsMounted(true);
    }, []);

  return (
    <Sidebar collapsible="icon"
    variant="floating"
    className="bg-gradient-to-b from-purple-50 to-white border-r">
      <SidebarHeader className={cn(open ? "pl-2" : "pl-0")}>
        <div
          className={cn(
            "text-xl font-bold text-purple-700",
            open ? "flex items-center gap-2 justify-start" : "flex justify-center"
          )}
        >
          <Brain className="h-6 w-6" />
          {isMounted && open && <span>NeuroHub</span>}
        </div>
      </SidebarHeader>



      <SidebarContent>
        {/* Application Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {appcontent.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link
                      href={item.url}
                      className={cn(
                        "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted",
                        pathname === item.url && "bg-primary text-white"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      <span className="truncate">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Projects Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Your Projects</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
            {projects?.map((project) => (
              <SidebarMenuItem key={project.name}>
                <SidebarMenuButton asChild>
                  <div
                    onClick={() => setProjectId(project.id)}
                    className={cn(
                      "flex items-center rounded-md py-2 text-sm hover:bg-muted transition-colors",
                      open ? "px-3 gap-3 justify-start" : "justify-center px-0"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold uppercase border",
                        project.id === projectId
                          ? "bg-primary text-white border-transparent"
                          : "bg-white text-muted-foreground border-muted"
                      )}
                    >
                      {project.name[0]}
                    </div>

                    {open && (
                      <span className="truncate text-muted-foreground">
                        {project.name}
                      </span>
                    )}
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                <div className="pt-2">
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-3 px-1 py-2 text-sm font-medium text-purple-700 hover:bg-muted rounded-md"
                        onClick={() => {
                        window.location.href = "/create";
                        }}
                    >
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                        +
                        </div>
                        <span className="truncate">Create Project</span>
                    </Button>
                    </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        {
            open && (
                <div className="flex flex-col items-start px-4 py-3 text-xs text-muted-foreground space-y-1">
                    <div className="font-semibold text-purple-700">NeuroHub</div>
                    <div className="text-[10px]">© {new Date().getFullYear()} NeuroTech Inc.</div>
                    <div className="text-[10px]">v1.0.0</div>
                </div>
            )
        }
      </SidebarFooter>

    </Sidebar>
  );
}
