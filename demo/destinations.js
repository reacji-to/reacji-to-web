import { destinations as extensionDestinations } from '@reacji/destinations';

// Preview only destinations included in the public release. Slack stays on the
// isolated extension integration branch until it is ready to ship.
const entries = extensionDestinations.entries
  .filter(item => !['slack','private'].includes(item.id));
const byId = new Map(entries.map(item => [item.id, item]));
const get = id => {
  if (!byId.has(id)) throw new Error('Choose a supported reaction destination.');
  return byId.get(id);
};
export const destinations = Object.freeze({
  entries,
  get,
  has: id => byId.has(id),
  resolve(id, emoji, context) {
    get(id);
    const resolved = extensionDestinations.resolve(id, emoji, context);
    return byId.has(resolved) ? resolved : id;
  },
  dataField: id => extensionDestinations.dataField(get(id).id),
  readType: id => extensionDestinations.readType(get(id).id),
  action: (id, emoji, context) => extensionDestinations.action(get(id).id, emoji, context),
});
