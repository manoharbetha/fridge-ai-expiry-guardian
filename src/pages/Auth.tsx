
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

// Placeholder Unsplash image id (the most professional and premium-looking one)
// You can replace this if you upload your own images!
const IMAGE_URL = "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&w=820&q=80";

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Logged in successfully!');
      navigate('/');
    }
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: `${window.location.origin}/`,
      },
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.info('Check your email for the confirmation link.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-gradient-to-bl from-emerald-50 via-green-100 to-teal-200 overflow-hidden relative">
      {/* Animated blurred background blob effect */}
      <div
        className="absolute -top-40 -left-52 w-[520px] h-[520px] bg-gradient-to-tr from-emerald-400/30 via-green-300/20 to-teal-300/20 rounded-full blur-3xl animate-fade-in"
        aria-hidden="true"
        style={{ zIndex: 0 }}
      />
      <div
        className="absolute -bottom-32 right-0 w-[360px] h-[300px] bg-gradient-to-bl from-emerald-200/30 via-green-100/40 to-teal-200/10 rounded-full blur-2xl animate-fade-in"
        aria-hidden="true"
        style={{ zIndex: 0 }}
      />

      {/* Left Side: Visual (hidden on mobile) */}
      <div className="relative basis-1/2 min-h-[360px] h-[40vh] md:h-auto flex items-center justify-center overflow-hidden animate-fade-in animate-duration-700 hidden md:flex">
        <img
          src={IMAGE_URL}
          alt="Fridge login illustration"
          className="object-cover w-full h-full scale-105 transition-transform duration-1000 hover:scale-110"
          style={{ minHeight: '430px', borderRadius: '0 30px 30px 0', boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.23)' }}
        />
        {/* dark overlay for extra premium look */}
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-800/70 to-transparent"></div>
        <h1 className="absolute z-10 text-white text-3xl xl:text-4xl font-bold leading-snug drop-shadow-md left-10 bottom-10 font-playfair animate-fade-in animate-delay-400">
          Welcome to <span className="text-emerald-200">Smart Fridge</span>
        </h1>
      </div>

      {/* Right Side: Glass-on-gradient Auth Form */}
      <div className="flex-1 w-full flex items-center justify-center px-4 py-8 md:py-0 relative z-10 animate-scale-in animate-duration-500">
        <Card className="w-full max-w-md bg-white/80 dark:bg-background/90 backdrop-blur-xl shadow-2xl border-none rounded-3xl animate-fade-in animate-duration-700 animate-delay-100">
          <Tabs
            defaultValue="login"
            onValueChange={() => {
              setEmail('');
              setPassword('');
              setFullName('');
            }}
          >
            <TabsList className="grid w-full grid-cols-2 rounded-full bg-emerald-100/60 mb-0 mt-3">
              <TabsTrigger value="login" className="font-semibold text-emerald-700">Login</TabsTrigger>
              <TabsTrigger value="signup" className="font-semibold text-emerald-700">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <form onSubmit={handleLogin}>
                <CardHeader>
                  <CardTitle className="text-2xl font-bold font-playfair pb-2">Welcome back!</CardTitle>
                  <CardDescription className="pb-2">
                    Enter your credentials to access your smart fridge.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input id="login-email" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input id="login-password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                  </div>
                  <Button
                    type="submit"
                    className="w-full rounded-full bg-emerald-700 text-white font-bold transition-transform hover:scale-105 animate-fade-in"
                    disabled={loading}
                  >
                    {loading ? 'Logging in...' : 'Login'}
                  </Button>
                </CardContent>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              <form onSubmit={handleSignUp}>
                <CardHeader>
                  <CardTitle className="text-2xl font-bold font-playfair pb-2">Create an account</CardTitle>
                  <CardDescription className="pb-2">
                    Start managing your fridge and reducing waste today.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="signup-fullname">Full Name</Label>
                    <Input id="signup-fullname" placeholder="John Doe" required value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input id="signup-email" type="email" placeholder="m@example.com" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input id="signup-password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
                  </div>
                  <Button
                    type="submit"
                    className="w-full rounded-full bg-emerald-700 text-white font-bold transition-transform hover:scale-105 animate-fade-in"
                    disabled={loading}
                  >
                    {loading ? 'Creating account...' : 'Sign Up'}
                  </Button>
                </CardContent>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>

      {/* Responsive heading for mobile */}
      <div className="md:hidden w-full flex flex-col items-center absolute top-10 z-10 animate-fade-in">
        <h1 className="text-2xl font-bold font-playfair text-emerald-900">Smart Fridge</h1>
        <p className="text-emerald-700 font-medium">Manage your kitchen, effortlessly.</p>
      </div>
    </div>
  );
};

export default Auth;
