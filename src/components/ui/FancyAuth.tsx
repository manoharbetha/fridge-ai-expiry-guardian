import React, { useState, useRef, useEffect } from "react";
import { Eye, EyeOff, Github, Twitter, Linkedin, Mail, Lock, User } from "lucide-react";

export interface FancyAuthProps {
  mode: "login" | "signup";
  loading: boolean;
  onSubmit: (form: { email: string; password: string; fullName?: string }) => void;
  error?: string | null;
  onModeChange: (mode: "login" | "signup") => void;
}

const SocialButton: React.FC<{ icon: React.ReactNode; name: string; onClick?: () => void }> = ({
  icon,
  name,
  onClick,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <button
      type="button"
      title={name}
      className="relative group p-3 rounded-lg border border-border bg-background hover:bg-accent transition-all duration-300 ease-in-out overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <div
        className={`absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 transition-transform duration-500 ${
          isHovered ? "translate-x-0" : "-translate-x-full"
        }`}
      />
      <div className="relative text-foreground group-hover:text-primary transition-colors">
        {icon}
      </div>
    </button>
  );
};

interface FormFieldProps {
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon: React.ReactNode;
  showToggle?: boolean;
  onToggle?: () => void;
  showPassword?: boolean;
  autoComplete?: string;
}

const AnimatedFormField: React.FC<FormFieldProps> = ({
  type,
  placeholder,
  value,
  onChange,
  icon,
  showToggle,
  onToggle,
  showPassword,
  autoComplete,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const floatLabel = isFocused || (typeof value === "string" && value.length > 0);

  return (
    <div className="relative group">
      <div
        className="relative overflow-hidden rounded-lg border border-border bg-background transition-all duration-300 ease-in-out"
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors duration-200 group-focus-within:text-primary">
          {icon}
        </div>

        <input
          type={type}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="w-full bg-transparent pl-10 pr-12 py-3 text-foreground placeholder-transparent focus:outline-none"
        />

        <label
          className={[
            "absolute left-10 pointer-events-none bg-transparent transition-all duration-200 ease-in-out",
            floatLabel
              ? "top-2 text-xs text-primary font-medium opacity-100 translate-y-0"
              : "top-1/2 -translate-y-1/2 text-sm text-muted-foreground opacity-80"
          ].join(" ")}
        >
          {placeholder}
        </label>

        {showToggle && (
          <button
            type="button"
            tabIndex={-1}
            onClick={onToggle}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}

        {isHovering && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(200px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, 0.1) 0%, transparent 70%)`,
            }}
          />
        )}
      </div>
    </div>
  );
};

const FloatingParticles: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const setCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    setCanvasSize();
    window.addEventListener("resize", setCanvasSize);

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;

      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.speedX = (Math.random() - 0.5) * 0.5;
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.opacity = Math.random() * 0.2 + 0.1;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x > canvas.width) this.x = 0;
        if (this.x < 0) this.x = canvas.width;
        if (this.y > canvas.height) this.y = 0;
        if (this.y < 0) this.y = canvas.height;
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = `rgba(59, 130, 246, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const particles: Particle[] = [];
    const particleCount = 45;
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((particle) => {
        particle.update();
        particle.draw();
      });
      requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", setCanvasSize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" style={{ pointerEvents: "none" }} />;
};

export const FancyAuth: React.FC<FancyAuthProps> = ({ mode, loading, onSubmit, error, onModeChange }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setEmail("");
    setPassword("");
    setFullName("");
    setShowPassword(false);
  }, [mode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "signup") {
      onSubmit({ email, password, fullName });
    } else {
      onSubmit({ email, password });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative bg-gradient-to-br from-slate-50 via-emerald-50 to-sky-200 overflow-hidden">
      <FloatingParticles />
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-card/80 backdrop-blur-xl border border-border rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <User className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {mode === "signup" ? "Create Account" : "Welcome Back"}
            </h1>
            <p className="text-muted-foreground">
              {mode === "signup" ? "Sign up to get started" : "Sign in to continue"}
            </p>
          </div>
          {error && (
            <div className="mb-4 text-red-500 text-sm text-center font-medium animate-fade-in">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            {mode === "signup" && (
              <AnimatedFormField
                type="text"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                icon={<User size={18} />}
                autoComplete="name"
              />
            )}
            <AnimatedFormField
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail size={18} />}
              autoComplete="username"
            />
            <AnimatedFormField
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock size={18} />}
              showToggle
              onToggle={() => setShowPassword((p) => !p)}
              showPassword={showPassword}
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full relative group bg-primary text-primary-foreground py-3 px-4 rounded-lg font-medium transition-all duration-300 ease-in-out hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
            >
              <span
                className={`transition-opacity duration-200 ${loading ? "opacity-0" : "opacity-100"}`}
              >
                {mode === "signup" ? "Create Account" : "Sign In"}
              </span>
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
            </button>
          </form>
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-card text-muted-foreground">Or continue with</span>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3">
              <SocialButton icon={<Github size={20} />} name="GitHub" />
              <SocialButton icon={<Twitter size={20} />} name="Twitter" />
              <SocialButton icon={<Linkedin size={20} />} name="LinkedIn" />
            </div>
            {/* Social buttons are UI only, add handlers if you want OAuth */}
          </div>
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              {mode === "signup" ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                type="button"
                onClick={() => onModeChange(mode === "signup" ? "login" : "signup")}
                className="text-primary hover:underline font-medium"
              >
                {mode === "signup" ? "Sign in" : "Sign up"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
