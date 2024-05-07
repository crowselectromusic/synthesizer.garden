"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const yaml_1 = require("yaml");
const fdir_1 = require("fdir");
const fs_1 = __importDefault(require("fs"));
const lunr_1 = __importDefault(require("lunr"));
const path_1 = __importDefault(require("path"));
class Entity {
    constructor(name, type, id, images, tags, link, parent, path) {
        this.name = name;
        this.type = type;
        this.id = id;
        this.images = images;
        this.tags = tags;
        this.parent = parent;
        this.link = link;
        this.path = path;
    }
    ;
    static fromYaml(yaml, path) {
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
        const images = yaml.images || [];
        const tags = yaml.tags || [];
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
const api = new fdir_1.fdir().withFullPaths().filter((path) => path.endsWith(".yaml")).crawl("content");
const files = api.sync();
const entities = files.map((path) => {
    const data = fs_1.default.readFileSync(path, 'utf8');
    const yaml = (0, yaml_1.parse)(data);
    return Entity.fromYaml(yaml, path);
});
const entityMap = {};
const tagMap = {};
entities.forEach((entity) => {
    if (entityMap[entity.id] != undefined) {
        throw new Error(`duplicate entity id ${entity.id} at ${entity.path} and ${entityMap[entity.id].path}`);
    }
    entity.tags.forEach((tag) => {
        const current = tagMap[tag] || 0;
        tagMap[tag] = current + 1;
    });
    // copy images over
    entity.images.forEach((image) => {
        const base = path_1.default.dirname(entity.path);
        const imagePath = path_1.default.join(base, image);
        const destPath = path_1.default.join("./", "web", "images", image);
        fs_1.default.copyFileSync(imagePath, destPath);
        // use entity.path as the base
        // copy that + image to ./web/images/
    });
    entityMap[entity.id] = entity;
});
const instruments = entities.filter((entity) => { return entity.type == "instrument"; });
const idx = (0, lunr_1.default)(function () {
    this.ref('id');
    this.field('name');
    this.field('type');
    this.field('parent');
    this.field('tags');
    instruments.forEach((doc) => {
        this.add(doc);
    }, this);
});
fs_1.default.writeFileSync("./web/index.json", JSON.stringify(idx));
fs_1.default.writeFileSync("./web/content.json", JSON.stringify({ entities: entityMap, tags: tagMap }));
