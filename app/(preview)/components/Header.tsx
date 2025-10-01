import ProfileDropdown from "@/src/components/kokonutui/profile-dropdown";

export function Header() {
  const profileData = {
    name: "Pica User",
    email: "user@picaos.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=pica",
    subscription: "PRO",
    model: "Claude Sonnet 4.5",
  };

  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center">
            <span className="text-white font-bold text-sm">P</span>
          </div>
          <div>
            <h1 className="text-sm font-semibold text-foreground">Pica OneTool</h1>
            <p className="text-xs text-muted-foreground">150+ API Integrations</p>
          </div>
        </div>
      </div>

      <ProfileDropdown data={profileData} />
    </header>
  );
}
