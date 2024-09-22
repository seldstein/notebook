---
title: Decap and Netlify
tags: ["decap","static-site-generators", "netlify"]
---

Decap uses the [Netlify Identity Widget](https://decapcms.org/docs/choosing-a-backend/#add-the-netlify-identity-widget) to manage users.

The [admin-only solution](https://decapcms.org/docs/choosing-a-backend/), says you have to change email templates on Netlify, but that's a paid feature. I'm not going to pay to send one email, so what we'll do instead is send the invite and just tell the recipient to go to `<site>.com/admin` and see if that works.

## Pitfalls

The docs imply you should [store `admin/` in your site's output folder directly](https://decapcms.org/docs/install-decap-cms/), but this is bad idea. If you ever delete the public folder, `admin/` will go with it. Better to pass `admin/` to the ouput as a static resource.

## Help

- [Decap GitHub Discussions](https://github.com/decaporg/decap-cms/discussions)