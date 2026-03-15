/*
 * NE PAS MODIFIER — Framework AppCore (DzzD)
 * Personnalisation via la classe Component pour tous les écrans,
 * ou via les classes ComponentXxxxx pour un composant spécifique.
 * Auteur : DzzD (aka Bruno Augier)
 */


export class CoreComponent
{
    id;
    datas;
    childs;

    constructor(componentId)
    {
        this.id = componentId;
        this.datas = new Map(); 
        this.childs = new Map();
    }

    show()
    {
        console.log(`show(${this.id})`);
        id(this.id).classList.remove('hidden');
    }


    hide()
    {
        console.log(`hide(${this.id})`);
        id(this.id).classList.add('hidden');
    }

}