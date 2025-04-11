import { Handlers, PageProps, FreshContext } from "$fresh/server.ts";
import Axios from "npm:axios";
import BookComponent from "../../components/BookComponent.tsx";

export type Book = {
  id: string;
  title: string;
  cover?: string;
  author: string;
};

type Author = {
  name: string;
  bio?: string;
  books: Book[];
};

type AuthorResponse = {
  name: string;
  bio?: { value: string } | string;
};

type BooksResponse = {
  entries: Array<{
    key: string;
    title: string;
    covers?: number[];
  }>;
};

export const handler: Handlers<Author> = {
  GET: async (_req: Request, ctx: FreshContext<unknown, Author>) => {
    const { id } = ctx.params;

    const authorResponse = await Axios.get<AuthorResponse>(`https://openlibrary.org/authors/${id}.json`);
    const authorData = authorResponse.data;

    const worksResponse = await Axios.get<BooksResponse>(`https://openlibrary.org/authors/${id}/works.json`);
    const worksData = worksResponse.data.entries.slice(0, 6);

    const books = worksData.map((ch) => ({
      id: ch.key.replace("/works/", ""),
      title: ch.title,
      cover: ch.covers?.[0]
        ? `https://covers.openlibrary.org/b/id/${ch.covers[0]}-L.jpg`
        : undefined,
      author: authorData.name,
    }));

    return ctx.render({
      name: authorData.name,
      bio: typeof authorData.bio === "string" ? authorData.bio : authorData.bio?.value || "Biografía no disponible",
      books,
    });
  },
};

export default function AuthorPage({ data }: PageProps<Author>) {
  const { name, bio, books } = data;

  return (
    <div class="container">
      <h1 class="title">{name}</h1>
      {bio && <p class="bio">{bio}</p>}
      <BookComponent books={books} />
    </div>
  );
}
