"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useContext, useEffect } from "react";
import { useLazyQuery } from "@apollo/client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Lock, User as UserIcon } from "lucide-react";
import { z } from "zod";

import { AuthContext } from "@/context/AuthContext";
import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { NAME, PASSWORD, SIGN_IN } from "@/consts";
import { CHECK_PASSWORD } from "@/query";
import { FormType } from "@/type";

const schema = z.object({
  email: z.string().min(1),
  password: z.string().min(1),
});

const defaultValues: FormType = {
  email: "",
  password: "",
  remember: true,
};

const Login = () => {
  const { setAuthenticated, setAdmin, setUser } = useContext(AuthContext);
  const [checkPassword] = useLazyQuery(CHECK_PASSWORD);

  const router = useRouter();

  const form = useForm<FormType>({
    mode: "onChange",
    defaultValues,
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    form.setValue("email", "guest", {
      shouldDirty: true,
      shouldValidate: true,
    });
    form.setValue("password", "guest", {
      shouldDirty: true,
      shouldValidate: true,
    });
  }, [form]);

  const onSubmit = async (formData: FormType) => {
    const { email, password } = formData;

    const result = await checkPassword({
      variables: {
        id: email,
        pwd: password,
      },
    });

    const { isAdmin, success } = result.data.checkPassword;

    if (success) {
      setAuthenticated(true);
      setUser(email);
      setAdmin(isAdmin);
      router.push("/monitor");
    } else {
      setAuthenticated(false);
      setAdmin(false);
    }
  };

  return (
    <PageLayout title="">
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="max-w-md w-full mx-auto">
          <div className="glass-card p-8 animate-scale-in">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-primary/10 mb-4 animate-float">
                <Lock size={40} className="text-primary" />
              </div>
              <h2 className="text-2xl font-medium">Welcome to InfraHub</h2>
              <p className="text-muted-foreground mt-2">
                Enter your credentials to access your account
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <UserIcon size={16} className="text-primary" />
                        {NAME}
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter your name" 
                          {...field} 
                          className="py-2"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Lock size={16} className="text-primary" />
                        {PASSWORD}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Enter your password"
                          {...field}
                          className="py-2"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full py-2 mt-4">
                  {SIGN_IN}
                </Button>
              </form>
            </Form>
            
            <div className="mt-6 text-center text-sm text-muted-foreground">
              <p>Demo credentials are pre-filled for you</p>
              <p className="mt-1">Username: guest | Password: guest</p>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Login;
