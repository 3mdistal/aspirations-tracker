import type { Loader, LoaderContext } from "astro/loaders";
import { parse as parseYAML } from "yaml";

export function gitHubLoader(): Loader {
  if (!import.meta.env.GITHUB_TOKEN) {
    console.error("GITHUB_TOKEN is not set in environment variables");
  }
  return {
    name: "github-tasks",
    load: async ({ store, logger, parseData }: LoaderContext) => {
      const gitHubUrl =
        "https://api.github.com/repos/3mdistal/teenylilthoughts/contents/Aspirations/Tasks";

      logger.info(`Fetching data from: ${gitHubUrl}`);

      try {
        const response = await fetch(gitHubUrl, {
          headers: {
            Accept: "application/vnd.github.v3+json",
            Authorization: `Bearer ${import.meta.env.GITHUB_TOKEN}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        logger.info(`Fetched ${data.length} items from GitHub`);

        // Clear existing data
        store.clear();

        // Add new entries to the store
        for (const task of data) {
          const fileContent = await fetch(task.download_url, {
            headers: {
              Authorization: `Bearer ${import.meta.env.GITHUB_TOKEN}`,
            },
          }).then((res) => res.text());

          const [_, frontmatterContent, ...contentParts] =
            fileContent.split(/^---$/m);

          const frontmatter = frontmatterContent
            ? parseYAML(frontmatterContent.trim())
            : {};

          const content = contentParts.join("---").trim();

          const parsedData = await parseData({
            id: task.name.replace(/\.md$/, ""),
            data: {
              id: task.name.replace(/\.md$/, ""),
              title: task.name.replace(/\.md$/, ""),
              frontmatter: frontmatter,
              content: content,
              // Add any other properties you want to include
            },
          });

          store.set({
            id: task.name.replace(/\.md$/, ""),
            data: parsedData,
          });
        }

        logger.info(
          `GitHub tasks loaded successfully. Total tasks: ${
            store.keys().length
          }`
        );
      } catch (error) {
        console.error(`Error fetching GitHub tasks: ${error}`);
        if (error instanceof Error) {
          console.error(`Error details: ${error.message}`);
          console.error(`Error stack: ${error.stack}`);
        }
        // Propagate the error
        throw error;
      }
    },
  };
}
