import {
  Form,
  NavLink,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import type {
  LinksFunction,
  LoaderFunctionArgs,
} from "@remix-run/node";
import { useEffect } from "react";

import appStylesHref from "./app.css?url";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: appStylesHref },
];

import { createEmptyContact, getContacts } from "./data";

export const loader = async ({
  request,
}: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  console.log("SERVER loader q", q);

  const contacts = await getContacts(q);
  return json({ contacts, q });
};

export const action = async () => {
  const contact = await createEmptyContact();
  return redirect(`/contacts/${contact.id}/edit`);
};

export default function App() {
  const { contacts, q } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const submit = useSubmit();
  const searching =
    navigation.location &&
    new URLSearchParams(navigation.location.search).has(
      "q"
    );
  // console.log(`navigation.state: ${navigation.state}`);
  // contacts.forEach((contact) => {
  //   console.log(`contact.id: ${contact.id}`);
  // });

  // This will clear the search field if back button is used and the qParam is empty
  useEffect(() => {
    const searchField = document.getElementById("q");
    if (searchField instanceof HTMLInputElement) {
      console.log('Client useEffect q', q);

      searchField.value = q || "";
    }
  }, [q]); // This tells useEffect that needs to view q for changes(similar to Ember @tracked)

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div id="sidebar">
          <h1>Remix Contacts</h1>
          <div>
            <Form
              id="search-form"
              onChange={(event) => {
                const isFirstSearch = q === null;
                submit(event.currentTarget, {
                  replace: !isFirstSearch, // replaced current history so we can click back once
                });
              }}
              role="search">
              <input
                id="q"
                defaultValue={q || ""}
                aria-label="Search contacts"
                className={searching ? "loading" : ""}
                placeholder="Search"
                type="search"
                name="q"
              />
              <div
                id="search-spinner"
                hidden={!searching}
                aria-hidden
              />
            </Form>
            <Form method="post">
              <button type="submit">New</button>
            </Form>
          </div>
          <nav>
            {contacts.length ? (
                <ul>
                  {contacts.map((contact) => (
                    <li key={contact.id}>
                      <NavLink
                        className={({ isActive, isPending }) =>
                          isActive
                            ? "active"
                            : isPending
                            ? "pending"
                            : ""
                        }
                        to={`contacts/${contact.id}`}
                      >
                        {contact.first || contact.last ? (
                          <>
                            {contact.first} {contact.last}
                          </>
                        ) : (
                          <i>No Name</i>
                        )}{" "}
                        {contact.favorite ? (
                          <span>★</span>
                        ) : null}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>
                  <i>No contacts</i>
                </p>
              )}
          </nav>
        </div>

        <div
          className={
            navigation.state === "loading" && !searching
              ? "loading"
              : ""
          }
          id="detail">
          <Outlet />
        </div>

        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
