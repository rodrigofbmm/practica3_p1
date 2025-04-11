import Axios from 'npm:axios@1.3.4';
import { FreshContext, Handlers, PageProps } from "$fresh/server.ts";
import SearchComponent from "../components/SearchComponent.tsx";


type Book = {
  id: string;
  title: string;
  cover?: string;
  author: string;
};

type Data = {
  books: Book[];
};

type bookAPI = {
  docs: Array<{
    key: string;
    title: string;
    cover_i?: number;
    author_name?: string[];
  }>;
};

export const handler: Handlers = {
  GET: async (req: Request, ctx: FreshContext<unknown, Data>) => {
    const urlParams = new URL(req.url);
    const title = urlParams.searchParams.get("title");

    if (!title) return ctx.render({ books: [] });

    const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(title)}`;


    const response = await Axios.get<bookAPI>(url);
    const books: Book[] = response.data.docs.map((doc) => ({
        id: doc.key.replace("/works/", ""),
        title: doc.title,
        cover: doc.cover_i
          ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`
          : "No hay portada disponible",
        author: doc.author_name?.[0] ?? "Autor desconocido",
        }));

        return ctx.render({ books });

    },
};

const Page = (props: PageProps<Data>) => {
    const { books } = props.data;
  
    return (
      <div>
        <SearchComponent books={books} />
      </div>
    );
  };
  

export default Page;
