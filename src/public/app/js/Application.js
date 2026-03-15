import { CoreApplication } from "../../core/js/CoreApplication.js";

export class Application extends CoreApplication
{
  start()
  {
    super.start();
  }

  async open(componentId, args = null)
  {
    await super.open(componentId);
    
    switch(componentId)
    {
  

    }

  }

  async close(componentId, args = null)
  {
    await super.close(componentId);
    
    switch(componentId)
    {
  

    }
  }
}

Application.boot();
