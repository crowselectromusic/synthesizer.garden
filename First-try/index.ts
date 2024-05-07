import { parse, stringify } from 'yaml';
import { fdir, PathsOutput } from "fdir";
import fs from 'fs'
import lunr from "lunr";
import path from 'path';

class Entity {
  name: string;
  type: "company" | "instrument";
  id: string;
  images: string[];
  tags: string[];
  link: string;
  path: string;
  parent: string | undefined;

  constructor(name: string, type: "company" | "instrument", id: string, images: string[], tags: string[], link: string, parent: string | undefined, path: string) {
    this.name = name;
    this.type = type;
    this.id = id;
    this.images = images;
    this.tags = tags;
    this.parent = parent;
    this.link = link;
    this.path = path;
  };

  static fromYaml(yaml: any, path: string): Entity {
    const name = yaml.name;
    const id = yaml.id;
    const type = yaml.type;

    if (name == undefined) {
      throw new Error(`Undefined name at ${path}`);
    }

    if (id == undefined) {
      throw new Error(`Undefined id at ${path}`);
    }

    if (type == undefined) {
      throw new Error(`Undefined type at ${path}`);
    }

    if (!(type == "company" || type == "instrument")) {
      throw new Error(`Unrecognized type (${type}) of ${path}`);
    }

    if (type == "instrument" && yaml.parent == undefined) {
      throw new Error(`Instrument ${id} is missing a parent`);
    }

    const images: string[] = yaml.images || [];
    const tags: string[] = yaml.tags || [];

    if (type == "instrument" && images.length <= 0) {
      throw new Error(`Instrument (${id}) does not have any images`);
    }

    const link = yaml.link;

    if (link == undefined) {
      throw new Error(`Instrument (${id}) is missing a link`);
    }

    // should validate paths here. i.e. that the company id is equal to the directory it's in, and the parent id is equal to the directory it's in, etc.
    // or many extract the parent id and the id from the path? that might be nice. 

    return new Entity(yaml.name, yaml.type, yaml.id, images, tags, link, yaml.parent, path);
  }
}

const api = new fdir().withFullPaths().filter((path) => path.endsWith(".yaml")).crawl("content");
const files: PathsOutput = api.sync();

const entities: Entity[] = files.map((path)=>{
  const data = fs.readFileSync(path, 'utf8');
  const yaml = parse(data);
  return Entity.fromYaml(yaml, path);
})

const entityMap: { [id: string] : Entity } = {};

const tagMap: { [id: string] : number } = {};

entities.forEach((entity)=>{
  if (entityMap[entity.id] != undefined) {
    throw new Error(`duplicate entity id ${entity.id} at ${entity.path} and ${entityMap[entity.id].path}`);
  }

  entity.tags.forEach((tag)=>{
    const current = tagMap[tag] || 0;
    tagMap[tag] = current + 1;
  })

  // copy images over
  entity.images.forEach((image)=>{
    const base = path.dirname(entity.path);
    const imagePath = path.join(base, image);
    const destPath = path.join("./","web", "images", image);
    fs.copyFileSync(imagePath, destPath);
    // use entity.path as the base
    // copy that + image to ./web/images/
  })

  entityMap[entity.id] =  entity;
});

const instruments = entities.filter((entity)=>{ return entity.type == "instrument"});

const idx = lunr(function () {
  this.ref('id')
  this.field('name')
  this.field('type')
  this.field('parent')
  this.field('tags')

  instruments.forEach((doc)=>{
    this.add(doc)
  }, this)
})

fs.writeFileSync("./web/index.json", JSON.stringify(idx));
fs.writeFileSync("./web/content.json", JSON.stringify({entities: entityMap, tags: tagMap}));
