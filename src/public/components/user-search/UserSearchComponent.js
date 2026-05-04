import { SearchComponent } from "../../app/js/SearchComponent.js";

export class UserSearchComponent extends SearchComponent
{
  static appcoreClass = "components.user-search.user-search-component";

  route = "/api/search/users";
  title = "Recherche utilisateurs";
}
