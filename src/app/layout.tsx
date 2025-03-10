"use client";

import { removeTypenameFromVariables } from "@apollo/client/link/remove-typename";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { getMainDefinition } from "@apollo/client/utilities";
import { createClient } from "graphql-ws";
import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  ApolloProvider,
  split,
  from,
} from "@apollo/client";

import { AuthProvider } from "@/context/AuthContext";
import Header from "@/components/Header";
import "./globals.css";
import { useEffect } from "react";
import { Toaster } from "sonner";

const wsLink = new GraphQLWsLink(
  createClient({
    url: `ws://localhost:4000/graphql`,
  })
);

export const httpLink = createHttpLink({
  uri: `http://localhost:4000/graphql`,
});

const removeTypenameLink = removeTypenameFromVariables();
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  httpLink
);

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: from([removeTypenameLink, splitLink]),
});

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");

    if (!storedTheme || storedTheme === "light") {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else if (storedTheme === "dark") {
      document.documentElement.classList.add("dark");
    }
  }, []);

  return (
    <html lang="en">
      <body className="h-screen overflow-hidden">
        <ApolloProvider client={client}>
          <AuthProvider>
            <Header />
            {children}
            <Toaster />
          </AuthProvider>
        </ApolloProvider>
      </body>
    </html>
  );
};

export default RootLayout;
