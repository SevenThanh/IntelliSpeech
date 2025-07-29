import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../config/supabase';

const AuthContext = createContext({});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNavbar, setShowNavbar] = useState(false);

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Get user profile with username
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', session.user.id)
          .single();

        setUser({
          ...session.user,
          username: profile?.username
        });

        // If user is already logged in, show navbar
        setShowNavbar(true);
      } else {
        setUser(null);
        setShowNavbar(false);
      }
      setLoading(false);
    };

    getSession();

    // Helper function to fetch profile
    const fetchUserProfile = async (userId) => {
      try {
        console.log("Getting profile for user:", userId);
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', userId)
          .limit(1);

        if (profileError) {
          console.error("Failed to fetch profile:", profileError);
          return null;
        }

        const userProfile = profile && profile.length > 0 ? profile[0] : null;
        return userProfile;
      } catch (error) {
        return null;
      }
    };

    // Listen for auth changes (non-async callback)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
       
        if (session?.user) {
          // Set user immediately without profile data
          setUser({
            ...session.user,
            username: null // Will be updated after profile fetch
          });

          // Fetch profile data separately 
          fetchUserProfile(session.user.id).then(profile => {

            // Update user with profile data
            setUser(prev => ({
              ...prev,
              username: profile?.username
            }));
          });
          // Show navbar when user signs in
          if (event === 'SIGNED_IN') {
            console.log("Showing navbar");
            setShowNavbar(true);
          }
        } else {
          setUser(null);
          setShowNavbar(false);
        }
        setLoading(false);
      }
    );

    return () => subscription?.unsubscribe();
  }, []);

  // Check if username is available 
  const checkUsernameAvailability = async (username) => {
    console.log("checking username availability")
    const { data, error } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username.toLowerCase())
      .single();

    if (error && error.code === 'PGRST116') {
      // No rows returned, username is available
      return { available: true };
    } else if (data) {
      // Username exists
      return { available: false };
    } else {
      // Other error
      return { available: false, error: error.message };
    }
  };

  const signUp = async (email, password, username) => {
    try {
      // Check if username is available during signup
      const usernameCheck = await checkUsernameAvailability(username);
      if (!usernameCheck.available) {
        return {
          data: null,
          error: { message: usernameCheck.error || 'Username is already taken' }
        };
      }

      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username.toLowerCase()
          }
        }
      });

      if (authError) {
        return { data: null, error: authError };
      }

      return { data: authData, error: null };
    } catch (error) {
      return { data: null, error: { message: error.message } };
    }
  };

  const signIn = async (emailOrUsername, password) => {
    try {
      let email = emailOrUsername;

      // Check if input is username 
      console.log("Attempting to sign in")
      if (!emailOrUsername.includes('@')) {
        console.log("Signing in with username")
        // Look up email by username
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('email')
          .eq('username', emailOrUsername.toLowerCase())
          .single();

        if (profileError || !profile) {
          return {
            data: null,
            error: { message: 'Username not found' }
          };
        }
        console.log("Found email", profile.email)
        email = profile.email;
      }

      console.log("Signing in with supabase, email: " + email)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      console.log("Signed in with supabase, data: " + data)
      return { data, error };
    } catch (error) {
      console.log("Error signing in", error)
      return { data: null, error: { message: error.message } };
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setShowNavbar(false);
    }
    return { error };
  };

  // Function to show navbar after successful signup confirmation
  const showNavbarAfterSignup = () => {
    setShowNavbar(true);
  };

  const value = {
    user,
    loading,
    showNavbar,
    signUp,
    signIn,
    signOut,
    showNavbarAfterSignup,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 