# APPCOREJS HELLO WORLD

This recipe creates a minimal application that reads a greeting from PostgreSQL and displays it through an AppCoreJS API and frontend component.

## 1. Create and Generate the Project

```bash
mkdir appcore-hello
cd appcore-hello
npm init -y
npm pkg set type=module
npm pkg set scripts.start="node server.js"
npm install git+https://github.com/DzzD/appcorejs.git
npx app-core --project hello --server --front
```

The generated `core/` directories are read-only framework code. The generated `app/` and `hello/` files are preserved extension points.

## 2. Create PostgreSQL

Create:

```text
database/
├── compose.yml
└── sql/
    └── 001-init.sql
```

`database/compose.yml`:

```yaml
services:
  postgres:
    image: postgres:17
    environment:
      POSTGRES_DB: hello
      POSTGRES_USER: appcore
      POSTGRES_PASSWORD: appcore
    ports:
      - "5432:5432"
    volumes:
      - hello-data:/var/lib/postgresql/data

volumes:
  hello-data:
```

`database/sql/001-init.sql`:

```sql
CREATE TABLE public.greeting
(
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    message TEXT NOT NULL UNIQUE
);

INSERT INTO public.greeting (message)
VALUES ('Hello World from PostgreSQL');
```

Start PostgreSQL and apply the schema:

```bash
docker compose -f database/compose.yml up -d
docker compose -f database/compose.yml exec -T postgres \
    psql -U appcore -d hello -v ON_ERROR_STOP=1 \
    < database/sql/001-init.sql
```

## 3. Generate the Models

```bash
npx app-core \
    --project hello \
    --model \
    --model-noprefix \
    --dbhost localhost \
    --dbport 5432 \
    --dbuser appcore \
    --dbpassword appcore \
    --dbname hello \
    --dbschema public
```

This creates:

```text
app/db/models/Greeting.js              one-shot generated; editable
core/db/models/CoreGreeting.js         regenerated from PostgreSQL; do not edit
```

The inheritance chain is:

```text
Greeting -> CoreGreeting -> DbObject -> CoreDbObject
```

After a schema change, apply its SQL first and run the model command again. The core model is regenerated; the app model is preserved.

## 4. Add an Optional Project Specialization

Create `hello/db/models/HelloGreeting.js`:

```js
import { Greeting } from '../../../app/db/models/Greeting.js';

export class HelloGreeting extends Greeting
{
    get displayMessage()
    {
        return this.message.toUpperCase();
    }
}
```

This project level adds behavior without changing the generated SQL mapping.

## 5. Create a Query Object

Create `hello/db/queries/HelloQuery.js`:

```js
import { DbQueryObject } from '../../../app/db/DbQueryObject.js';
import { HelloGreeting } from '../models/HelloGreeting.js';

export class HelloQuery extends DbQueryObject
{
    constructor(connectionUid = 'default')
    {
        super('hello', connectionUid);

        this._query = `
            SELECT to_jsonb(greeting) AS greeting
            FROM public.greeting
            ORDER BY greeting.id
        `;

        this.addDbObject(HelloGreeting, 'greeting', 'greeting');
    }
}
```

The SQL alias `greeting` matches the alias passed to `addDbObject()`. Each successful `next()` reconstructs `query.greeting` as a `HelloGreeting`.

## 6. Register the Runtime Database

In root `server.js`, import:

```js
import { DbManager } from './app/db/DbManager.js';
```

After the generated server construction and before `await server.start()`, add:

```js
DbManager.addDatabase(
{
    name: 'hello',
    host: 'localhost',
    port: 5432,
    database: 'hello',
    user: 'appcore',
    password: 'appcore'
});
```

The name `hello` matches the database name passed to `HelloQuery`.

## 7. Create the API Component

Create `hello/server/components/HelloServerComponent.js`:

```js
import { ServerComponent } from '../../../app/server/ServerComponent.js';
import { HelloQuery } from '../../db/queries/HelloQuery.js';

export class HelloServerComponent extends ServerComponent
{
    async start()
    {
        this.server.application.get('/api/hello', async (request, response, next) =>
        {
            const query = new HelloQuery();

            try
            {
                await query.search(null, [], { limit: 1 });
                const row = await query.next();

                if (!row)
                {
                    response.status(404).json({ error: 'Greeting not found' });
                    return;
                }

                response.json(
                {
                    id: query.greeting.id,
                    message: query.greeting.displayMessage
                });
            }
            catch (error)
            {
                next(error);
            }
            finally
            {
                query.close();
            }
        });
    }
}
```

In `hello/server/HelloServer.js`, import the component:

```js
import { HelloServerComponent } from './components/HelloServerComponent.js';
```

Register it before static file serving:

```js
this.registerServerComponent(new HelloServerComponent());
this.registerServerComponent(new StaticFileServerComponent());
```

Keep the generated Chrome DevTools registration. The route accesses PostgreSQL only through `HelloQuery` and its mapped `DbObject`.

## 8. Add the Frontend Data Method

Replace the empty class body in `hello/public/js/io/Data.js`:

```js
export class Data
{
    async getHello()
    {
        const response = await fetch('/api/hello');

        if (!response.ok)
        {
            throw new Error(`Hello request failed: ${response.status}`);
        }

        return await response.json();
    }
}
```

AppCoreJS creates this class once and exposes it as `App.data`.

## 9. Create the Frontend Entry Templates

The generated core versions are fallbacks. Create project-owned versions in `hello/public/` before adding the UI.

`hello/public/index.tpl.html` is the HTML document entry point. It loads the application styles and class, then declares the root Application component:

```html
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>AppCoreJS Hello World</title>
        <link rel="stylesheet" href="./app/css/styles.css">
        <script type="module" src="./app/js/Application.js"></script>
    </head>
    <body
        data-appcore-id="app.js.application"
        data-template="application">
    </body>
</html>
```

`hello/public/application.tpl.html` is mandatory. It defines the application shell loaded into the root component and contains the application zone revealed when startup completes:

```html
<div data-template="application">
    <div data-zone="application" style="display: none;">
        <main>
            <section
                data-appcore-id="components.hello.hello-component::main"
                data-template="components.hello.hello-component">
            </section>
        </main>
    </div>
</div>
```

Do not modify `public/core/index.tpl.html` or `public/core/application.tpl.html`; synchronization replaces core files.

## 10. Create the Frontend Component

Create:

```text
hello/public/components/hello/
├── HelloComponent.js
├── hello-component.tpl.html
└── hello-component.css
```

`HelloComponent.js`:

```js
import { Component } from '../../app/js/Component.js';

export class HelloComponent extends Component
{
    static appcoreClass = 'components.hello.hello-component';
    static appcoreCss = 'components.hello.hello-component';

    async onLoad()
    {
        await super.onLoad();

        const greeting = await App.data.getHello();
        this.find('[data-zone="message"]').textContent = greeting.message;
    }
}
```

`hello-component.tpl.html`:

```html
<section data-appcore-class="components.hello.hello-component">
    <h1 data-zone="message">Loading...</h1>
</section>
```

`hello-component.css`:

```css
[data-appcore-class~="components.hello.hello-component"]
{
    display: grid;
    min-height: 100vh;
    place-items: center;
    padding: 2rem;
    text-align: center;
}

[data-appcore-class~="components.hello.hello-component"] h1
{
    color: #1769aa;
    font-size: clamp(2rem, 8vw, 5rem);
}
```

The project index starts `Application`. It loads the mandatory application template, then the component template and inherited CSS, then calls `HelloComponent.onLoad()`. The component calls `App.data`, the API uses `HelloQuery`, and the mapped `HelloGreeting` contains the PostgreSQL row.

## 11. Run

```bash
npm start
```

Open `http://127.0.0.1:3000/`. The page displays the greeting read from PostgreSQL. The API is available at `http://127.0.0.1:3000/api/hello`.
