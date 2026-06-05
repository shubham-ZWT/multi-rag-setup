"use client";
import Button from "../ui/Button";

export default function Hero() {
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
    <div className="w-full h-screen mesh-gradient">
      <div className="max-w-7xl mx-auto px-4 h-full flex flex-col items-center justify-center relative z-10 text-primary">
        <div className="flex flex-row max-w-7xl">
          <div>
            <h1 className="text-6xl font-semibold mb-6">
              <span>Experience</span> <br></br>the power of{" "}
              <span className="font-serif">RAG </span> in your application with
              ease
            </h1>
          </div>
          <div className="ml-12 flex flex-col justify-center">
            <p className="text-lg mb-8">
              Deploy and manage your RAG bots with ease, no matter the
              complexity, just upload your knowledge source and let the platform
              handle the rest.
            </p>
            <div className="flex items-center gap-6">
              <Button
                isprimary={false}
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
                        className="w-10 h-10 rounded-full object-cover border-2 border-white"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-sm">Trusted by over 500+ users worldwide</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
