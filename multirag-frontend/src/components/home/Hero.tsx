"use client";
import Button from "../ui/Button";
import { useHomeTheme } from "../providers/HomeThemeProvider";

export default function Hero() {
  const { theme } = useHomeTheme();
  const isLight = theme === "light";

  const users = [
    {
      name: "Alice Johnson",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    {
      name: "Bob Smith",
      avatar: "https://randomuser.me/api/portraits/men/45.jpg",
    },
    {
      name: "Charlie Davis",
      avatar: "https://randomuser.me/api/portraits/men/46.jpg",
    },
  ];

  return (
    <div className={`w-full h-screen ${isLight ? "bg-gradient-to-br from-blue-100 via-white to-blue-100" : "mesh-gradient"}`}>
      <div className={`max-w-7xl mx-auto px-6 h-full flex flex-col items-center justify-center relative z-10 ${isLight ? "text-gray-900" : "text-primary"}`}>
        <div className="flex flex-col md:flex-row items-center md:items-stretch gap-8 md:gap-12">
          <div className="flex-1">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold mb-6">
              <span>Experience</span> <br />the power of{" "}
              <span className="font-serif">RAG</span> in your application with
              ease
            </h1>
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <p className={`text-base sm:text-lg mb-8 ${isLight ? "text-gray-600" : ""}`}>
              Deploy and manage your RAG bots with ease, no matter the
              complexity, just upload your knowledge source and let the platform
              handle the rest.
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
              <Button
                isprimary={true}
                onClick={() => alert("Get Started clicked")}
              >
                Get Started
              </Button>
              <div className="flex items-center gap-2">
                <div className="flex -space-x-4">
                  {users.map((user, index) => (
                    <div key={index} className="flex items-center">
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className={`w-10 h-10 rounded-full object-cover border-2 ${isLight ? "border-gray-200" : "border-white"}`}
                      />
                    </div>
                  ))}
                </div>
                <p className={`text-sm ${isLight ? "text-gray-600" : ""}`}>Trusted by over 500+ users worldwide</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
