import slugify from "slugify";

export default function slug(string: string) {
  return slugify(string, {
    lower: true,
    remove: /[*+~.()'"!:@]/g,
  });
}
