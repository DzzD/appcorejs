import { ComponentSearch } from "./ComponentSearch.js";

export class UserSearch extends ComponentSearch
{
  static appcoreClass = "app.js.user-search";

  route = "/api/search/users";
  title = "Recherche utilisateurs";
}