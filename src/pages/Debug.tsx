import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const Debug = () => {
  const { toast } = useToast();
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const checkConfiguration = () => {
    setLoading(true);
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      if (!supabaseUrl || !supabaseKey) {
        setStatus(
          `Missing Configuration!\n` +
          `VITE_SUPABASE_URL: ${supabaseUrl ? "✓ Set" : "✗ Missing"}\n` +
          `VITE_SUPABASE_PUBLISHABLE_KEY: ${supabaseKey ? "✓ Set" : "✗ Missing"}\n\n` +
          `Current values:\n` +
          `URL: ${supabaseUrl || "undefined"}\n` +
          `KEY: ${supabaseKey ? supabaseKey.substring(0, 20) + "..." : "undefined"}`
        );
      } else {
        // Try to make a simple request to verify connectivity
        const testUrl = `${supabaseUrl}/rest/v1/`;
        fetch(testUrl, {
          method: "GET",
          headers: {
            "apikey": supabaseKey,
            "Accept": "application/json",
          },
          mode: "cors",
        })
          .then(() => {
            setStatus(
              `Configuration OK!\n\n` +
              `✓ Supabase URL is reachable\n` +
              `✓ API Key is valid\n\n` +
              `URL: ${supabaseUrl}\n` +
              `Key (first 20 chars): ${supabaseKey.substring(0, 20)}...`
            );
          })
          .catch((error) => {
            setStatus(
              `Configuration Error!\n\n` +
              `✗ Could not reach Supabase server\n\n` +
              `URL: ${supabaseUrl}\n` +
              `Error: ${error.message}\n\n` +
              `This could be a CORS issue or network connectivity problem.`
            );
          })
          .finally(() => setLoading(false));
      }
    } catch (error) {
      setStatus(`Error: ${error}`);
      setLoading(false);
    }
  };

  const checkDatabaseStatus = async () => {
    setLoading(true);
    try {
      // Check if profiles table is accessible
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("id, email, full_name")
        .limit(5);

      if (profileError) {
        setStatus(`Profiles Error: ${profileError.message}`);
      } else {
        setStatus(`Found ${profiles?.length || 0} profiles in database\n${JSON.stringify(profiles, null, 2)}`);
      }
    } catch (error) {
      setStatus(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const testDirectLogin = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: "oluwafemiod7@gmail.com",
        password: "Sijuade27#",
      });

      if (error) {
        setStatus(`Login Failed: ${error.message}`);
      } else {
        setStatus(`Login Successful!\nUser ID: ${data.user?.id}\nEmail: ${data.user?.email}`);
      }
    } catch (error) {
      setStatus(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const createTestUser = async () => {
    setLoading(true);
    try {
      // Try to register a new test user
      const { data, error } = await supabase.auth.signUp({
        email: "oluwafemiod7@gmail.com",
        password: "Sijuade27#",
        options: {
          data: {
            full_name: "Oluwafemi",
          },
        },
      });

      if (error) {
        setStatus(`Signup Error: ${error.message}`);
      } else {
        setStatus(`User Created!\nUser ID: ${data.user?.id}\nEmail: ${data.user?.email}\nNote: Check email for confirmation (or use the setup page)`);
      }
    } catch (error) {
      setStatus(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const runSetupAdmin = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("setup-admin");
      if (error) {
        setStatus(`Setup Error: ${error.message}`);
      } else {
        setStatus(`Setup Complete!\n${JSON.stringify(data, null, 2)}`);
      }
    } catch (error) {
      setStatus(`Error: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-8 space-y-6">
      <h1 className="text-3xl font-bold">Debug Dashboard</h1>

      <Card>
        <CardHeader>
          <CardTitle>Configuration & Connectivity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Button onClick={checkConfiguration} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
              Check Configuration & Connection
            </Button>
          </div>

          {status && (
            <div className="rounded-lg bg-secondary p-4 font-mono text-sm whitespace-pre-wrap break-words max-h-96 overflow-y-auto">
              {status}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Database & Auth Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Button onClick={checkDatabaseStatus} disabled={loading} className="w-full">
              Check Database Status
            </Button>
            <Button onClick={testDirectLogin} disabled={loading} variant="outline" className="w-full">
              Test Login (oluwafemiod7@gmail.com)
            </Button>
            <Button onClick={createTestUser} disabled={loading} variant="outline" className="w-full">
              Create/Register Test User
            </Button>
            <Button onClick={runSetupAdmin} disabled={loading} variant="outline" className="w-full">
              Run Setup Admin Function
            </Button>
          </div>

          {status && (
            <div className="rounded-lg bg-secondary p-4 font-mono text-sm whitespace-pre-wrap break-words max-h-96 overflow-y-auto">
              {status}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <ol className="list-decimal list-inside space-y-2">
            <li>Click "Check Database Status" to see existing users</li>
            <li>Click "Create/Register Test User" to register oluwafemiod7@gmail.com</li>
            <li>Click "Run Setup Admin Function" to make them admin</li>
            <li>Click "Test Login" to verify login works</li>
            <li>Go to /login and use those credentials</li>
          </ol>
          <p className="text-muted-foreground">
            If you see RLS policy errors, you need to run the SQL script in supabase/fix-rls.sql
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Debug;
