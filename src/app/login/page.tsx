"use client";

import { useContext, useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { gql, useLazyQuery } from "@apollo/client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Lock } from "lucide-react";
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

const schema = z.object({
  email: z.string().min(1),
  password: z.string().min(1),
});

type FormType = {
  email: string;
  password: string;
  remember?: boolean;
};

const defaultValues: FormType = {
  email: "",
  password: "",
  remember: true,
};

export const CHECK_PASSWORD = gql(`
	query CHECK_PASSWORD($id: String, $pwd: String){
	  checkPassword(id:$id, pwd:$pwd){
      isAdmin
      success
    }
	} 
	`);

export default function Login() {
  const { setAuthenticated, setAdmin } = useContext(AuthContext);
  const [checkPassword] = useLazyQuery(CHECK_PASSWORD);

  const router = useRouter();

  const [loading, setLoading] = useState(false);

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

  async function onSubmit(formData: FormType) {
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
      setAdmin(isAdmin);
      router.push("/monitor");
    } else {
      setAuthenticated(false);
      setAdmin(false);
    }
  }

  return (
    <PageLayout title="">
      <div className="max-w-md mx-auto">
        <div className="glass-card rounded-xl p-8 animate-scale-in">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-primary/10 mb-4">
              <Lock size={40} className="text-primary" />
            </div>
            <h2 className="text-2xl font-medium">Sign In</h2>
            <p className="text-muted-foreground mt-1">
              Enter your credentials to access your account
            </p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your name" {...field} />
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
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Sign In</Button>
            </form>
          </Form>
        </div>
      </div>
    </PageLayout>
  );
}
