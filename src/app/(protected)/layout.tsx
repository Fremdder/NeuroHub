import { SidebarProvider } from "@/components/ui/sidebar";
import { UserButton } from "@clerk/nextjs";
import React from "react";
import { AppSidebar } from "./app-sidebar";

type Props = {
  children: React.ReactNode;
};

const SidebarLayout = ({ children }: Props) => {
  return (
    <SidebarProvider>
      <AppSidebar />

      <main className="w-full min-h-screen bg-gray-100">
        {/* Top Bar */}
        <div className="flex items-center justify-between border-sidebar-border bg-sidebar border shadow rounded-md p-2 px-4 m-4">
          {/* <SearchBar /> */}
          <div className="ml-auto" />
          <UserButton />
        </div>

        {/* Content Area */}
        <div className="m-4 border-sidebar-border bg-sidebar border shadow rounded-md overflow-y-auto h-[calc(100vh-10rem)] p-4">
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
};

export default SidebarLayout;
