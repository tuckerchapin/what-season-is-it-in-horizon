# What season is it in Horizon?

<!-- link-preview https://whatseasonisitinhorizon.com/ -->
> <a href="https://whatseasonisitinhorizon.com/"><img src="https://whatseasonisitinhorizon.com/icon.svg" width="16" height="16" alt=""></a> Horizon Season
>
> **[What season is it in Forza Horizon 4?](https://whatseasonisitinhorizon.com/)**
>
> Which season is it in Forza Horizon 4 right now? A live countdown to the next weekly season change, over community photos from the Horizon Festival.
>
> <a href="https://whatseasonisitinhorizon.com/"><img src="https://whatseasonisitinhorizon.com/og.jpg" width="400" alt="The Winter, Spring, Summer and Autumn season banners from Forza Horizon 4 over community photos."></a>
<!-- /link-preview -->

[whatseasonisitinhorizon.com](https://whatseasonisitinhorizon.com) shows the current season in Forza Horizon 4 and counts down to the next one, like the in-game timer, over a random community photo.

Built in 2018 and rebuilt in 2026 as a single static page.

```sh
pnpm install
pnpm dev     # http://localhost:4173
pnpm check   # typecheck + tests + build
```

Photos are by Forza Horizon players on reddit. Each one is credited on the page.

## README link preview

The block at the top of this README shows how the site unfurls in Slack and similar apps. `scripts/readme-preview.py` (Python standard library only, the same file as in `tuckerchapin.github.io`) fetches the **live** site and rewrites everything between the `<!-- link-preview URL -->` and `<!-- /link-preview -->` markers. After deploying a change to the title, description, favicon or preview image, run `python3 scripts/readme-preview.py` and commit the README. `--check` exits 1 if it's stale.
