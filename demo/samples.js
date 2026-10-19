export const samplePosts = [
  { id: 'post-x', post: { platform: 'x', id: '1503926848073322500' } },
  { id: 'post-linkedin', post: { platform: 'linkedin', id: '7335674367755853826' } },
  { id: 'post-devnull', post: { platform: 'devnull', id: '01a14f9d-76a7-72d9-a92d-48ae9ea999cb', author: 'nunomaduro' } },
];
export function discoverSamples() {
  return samplePosts.map(sample => {
    const article = document.getElementById(sample.id);
    return { article, anchor: article.querySelector('[data-reaction-anchor]'), post: sample.post, inline: true };
  });
}
