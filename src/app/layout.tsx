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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ApolloProvider client={client}>
          <AuthProvider>
            <Header />
            {children}
          </AuthProvider>
        </ApolloProvider>
      </body>
    </html>
  );
}
