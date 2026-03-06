import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { toast } from 'sonner';

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>Please login to view your profile</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate('/login')} className="w-full">
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const userMetadata = user.user_metadata || {};
  const fullName = userMetadata.full_name || userMetadata.name || 'User';
  const avatarUrl = userMetadata.avatar_url || userMetadata.picture || '';
  const email = user.email || '';
  const provider = user.app_metadata?.provider || 'email';

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSaveProfile = () => {
    toast.success('Profile updated successfully');
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 pt-20 pb-12 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header Card */}
        <Card className="border-gray-700 bg-gray-800/50 backdrop-blur">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl text-white">Profile</CardTitle>
                <CardDescription className="text-gray-400">
                  Manage your account information
                </CardDescription>
              </div>
              <Button
                variant={isEditing ? 'default' : 'outline'}
                onClick={() => setIsEditing(!isEditing)}
                className={isEditing ? '' : 'border-gray-600 text-gray-300 hover:bg-gray-700'}
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center space-x-6">
              <Avatar className="h-24 w-24 border-2 border-gray-600">
                <AvatarImage src={avatarUrl} alt={fullName} />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl">
                  {getInitials(fullName)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-white">{fullName}</h3>
                <p className="text-gray-400">{email}</p>
                <div className="mt-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    {provider === 'google' ? '🔗 Google Account' : '📧 Email Account'}
                  </span>
                </div>
              </div>
            </div>

            <Separator className="bg-gray-700" />

            {/* Profile Information Form */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-gray-300">
                    Full Name
                  </Label>
                  <Input
                    id="fullName"
                    defaultValue={fullName}
                    disabled={!isEditing}
                    className="bg-gray-700/50 border-gray-600 text-white disabled:opacity-60"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue={email}
                    disabled
                    className="bg-gray-700/50 border-gray-600 text-white disabled:opacity-60"
                  />
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSaveProfile}>Save Changes</Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Account Details Card */}
        <Card className="border-gray-700 bg-gray-800/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white">Account Details</CardTitle>
            <CardDescription className="text-gray-400">
              Your account information and statistics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-gray-700/30 border border-gray-600">
                <p className="text-sm text-gray-400">Account ID</p>
                <p className="text-white font-mono text-sm mt-1">{user.id.slice(0, 8)}...</p>
              </div>
              <div className="p-4 rounded-lg bg-gray-700/30 border border-gray-600">
                <p className="text-sm text-gray-400">Member Since</p>
                <p className="text-white font-medium mt-1">
                  {new Date(user.created_at || '').toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-gray-700/30 border border-gray-600">
                <p className="text-sm text-gray-400">Last Sign In</p>
                <p className="text-white font-medium mt-1">
                  {new Date(user.last_sign_in_at || '').toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-gray-700/30 border border-gray-600">
                <p className="text-sm text-gray-400">Authentication Method</p>
                <p className="text-white font-medium mt-1 capitalize">{provider}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Betting Statistics Card */}
        <Card className="border-gray-700 bg-gray-800/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white">Betting Statistics</CardTitle>
            <CardDescription className="text-gray-400">
              Your betting performance overview
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-lg bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30">
                <p className="text-3xl font-bold text-green-400">0</p>
                <p className="text-sm text-gray-400 mt-1">Total Bets</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30">
                <p className="text-3xl font-bold text-blue-400">0</p>
                <p className="text-sm text-gray-400 mt-1">Wins</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-gradient-to-br from-red-500/20 to-red-600/20 border border-red-500/30">
                <p className="text-3xl font-bold text-red-400">0</p>
                <p className="text-sm text-gray-400 mt-1">Losses</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-600/20 border border-purple-500/30">
                <p className="text-3xl font-bold text-purple-400">0%</p>
                <p className="text-sm text-gray-400 mt-1">Win Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}