(() => {
  // The banner can be injected more than once into docs HTML; reuse shared
  // state so layout classes, old banner nodes, and document listeners are
  // removed before a replacement instance mounts.
  const stateKey = "__envoyDocsBannerState";
  const currentScript = document.currentScript instanceof HTMLScriptElement
    ? document.currentScript
    : null;
  const currentPath = location.pathname;
  const mountSelector = currentScript?.dataset?.envoyDocsMount;
  const mountTarget = (() => {
    if (mountSelector) {
      return document.querySelector(mountSelector);
    }
    return document.querySelector("[data-envoy-docs-version-mount]");
  })();
  const mountMode = mountTarget instanceof Element;
  const previousState = globalThis[stateKey];
  if (previousState?.controller instanceof AbortController) {
    previousState.controller.abort();
  }
  if (typeof previousState?.cleanup === "function") {
    previousState.cleanup();
  }
  const controller = new AbortController();
  const cleanup = () => {
    document.querySelector(".envoy-docs-banner")?.remove();
    mountTarget?.querySelector("[data-envoy-docs-version-mounted]")?.remove();
    document.body.classList.remove("envoy-has-site-banner", "envoy-shell-topbar", "envoy-shell-rtd");
  };
  controller.signal.addEventListener("abort", cleanup, { once: true });
  globalThis[stateKey] = { controller, cleanup };

  const DOCS_PREFIX = "/docs/envoy/";
  const VERSIONS_URL = `${DOCS_PREFIX}versions.json`;
  const OPEN_SHORTCUT = "V";
  const instanceId = `envoy-docs-banner-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const LIST_ID = `${instanceId}-version-list`;
  const MENU_ID = `${instanceId}-version-menu`;
  const SEARCH_ID = `${instanceId}-version-search`;

  const isEditableTarget = (target) => target instanceof Element &&
    (target.closest("input, textarea, select, [contenteditable='true']") !== null);

  const isExternalUrl = (url) => {
    try {
      return new URL(url, location.origin).origin !== location.origin;
    } catch {
      return true;
    }
  };

  const currentSection = (() => {
    if (currentPath.startsWith("/docs")) {
      return "/docs";
    }
    const [segment] = currentPath.split("/").filter(Boolean);
    return segment ? `/${segment}` : "/";
  })();

  const matchesNavPath = (navUrl) => {
    if (!navUrl || isExternalUrl(navUrl)) {
      return false;
    }
    const normalized = navUrl === "/" ? "/" : navUrl.replace(/\/+$/, "");
    return normalized === "/"
      ? currentPath === "/"
      : currentSection === normalized || currentPath === normalized || currentPath.startsWith(`${normalized}/`);
  };

  const readVersionFromPath = () => {
    if (!currentPath.startsWith(DOCS_PREFIX)) {
      return null;
    }
    const rel = currentPath.slice(DOCS_PREFIX.length);
    const [segment] = rel.split("/");
    return segment || null;
  };

  const normalizeVersion = (version) => {
    if (!version) return "";
    if (version === "latest") return "latest";
    return version.replace(/^v/, "");
  };

  const currentVersion = normalizeVersion(
    readVersionFromPath() || "",
  );
  const hasCurrentVersion = Boolean(currentVersion);

  if (!hasCurrentVersion && !mountMode) {
    return;
  }

  const relPath = (() => {
    const parts = location.pathname.slice(DOCS_PREFIX.length).split("/");
    parts.shift();
    return parts.join("/");
  })();

  const withLeadingV = (version) => (version === "latest" ? version : `v${normalizeVersion(version)}`);

  const buildVersionLink = (version) => {
    const base = `${DOCS_PREFIX}${withLeadingV(version)}/`;
    if (!hasCurrentVersion) {
      return base;
    }
    return `${relPath ? base + relPath : base}${location.search}${location.hash}`;
  };

  const displayName = (version) => (version === "latest" ? "Latest (development)" : `v${version}`);

  // Sort key: "latest" first, then semver descending.
  const versionKey = (version) => {
    if (version === "latest") return [Infinity];
    return version.split(".").map((part) => Number.parseInt(part, 10) || 0);
  };
  const compareVersionsDesc = (a, b) => {
    const ka = versionKey(a.version);
    const kb = versionKey(b.version);
    for (let i = 0; i < Math.max(ka.length, kb.length); i++) {
      const diff = (kb[i] ?? 0) - (ka[i] ?? 0);
      if (diff !== 0) return diff;
    }
    return 0;
  };

  fetch(VERSIONS_URL)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`fetch failed: ${response.status}`);
      }
      return response.json();
    })
    .then((versions) => {
      // versions.json shape (see site/data/versions-browser.jq):
      //   stable:   { "1.39": ["1.39.1", "1.39.0"], ... }  (each list sorted desc)
      //   archived: { "1.13": ["1.13.7", ...], ... }
      //
      // Only the head of each supported branch is a "stable" release. Older
      // patches on those branches and everything under `archived` are
      // reachable only via search.
      const stableBranches = versions.stable || {};
      const archivedBranches = versions.archived || {};

      const seen = new Set();
      const options = [];
      const pushOption = (version, state, featured) => {
        const normalized = normalizeVersion(version);
        if (!normalized || seen.has(normalized)) {
          return;
        }
        seen.add(normalized);
        options.push({ version: normalized, state, featured });
      };

      pushOption("latest", "dev", true);
      for (const patches of Object.values(stableBranches)) {
        patches.forEach((version, index) => {
          pushOption(version, index === 0 ? "stable" : "archived", index === 0);
        });
      }
      for (const patches of Object.values(archivedBranches)) {
        patches.forEach((version) => pushOption(version, "archived", false));
      }
      // The page being viewed is always listed, even if it is an old patch.
      const current = options.find((option) => option.version === currentVersion);
      if (current) {
        current.featured = true;
      }
      // Branch keys come out of the JSON object in insertion order, which
      // isn't guaranteed to be newest-first; sort explicitly.
      options.sort(compareVersionsDesc);

      const createVersionMenu = () => {
        const versionRoot = document.createElement("div");
        versionRoot.className = "envoy-docs-banner__version";
        versionRoot.dataset.envoyDocsVersionMounted = "true";
        versionRoot.innerHTML = `
          <button type="button" class="envoy-docs-banner__version-button"
                  aria-expanded="false" aria-haspopup="dialog" aria-controls="${MENU_ID}"
                  aria-label="${hasCurrentVersion ? `Documentation version: ${displayName(currentVersion)}. Switch version` : "Choose documentation version"}">
            <span class="envoy-docs-banner__version-prefix">docs:</span> ${hasCurrentVersion ? displayName(currentVersion) : "choose version"}
          </button>
          <div id="${MENU_ID}" class="envoy-docs-banner__menu" role="dialog"
               aria-label="Switch documentation version" hidden>
            <input id="${SEARCH_ID}" class="envoy-docs-banner__search" type="search"
                   placeholder="Search versions (e.g. 1.28)" autocomplete="off" spellcheck="false"
                   role="combobox" aria-autocomplete="list" aria-expanded="true"
                   aria-controls="${LIST_ID}" aria-label="Search documentation versions" />
            <ul id="${LIST_ID}" class="envoy-docs-banner__list" role="listbox"
                aria-label="Envoy documentation versions"></ul>
            <p class="envoy-docs-banner__hint">Older releases: type a version. <kbd>Shift</kbd>+<kbd>V</kbd> opens this menu.</p>
          </div>
        `;
        return versionRoot;
      };

      const versionMenu = createVersionMenu();
      const banner = mountMode ? null : document.createElement("div");
      if (banner) {
        banner.className = "envoy-docs-banner";
        banner.innerHTML = `
          <div class="envoy-docs-banner__nav-row">
            <a class="envoy-docs-banner__logo" href="/" aria-label="Envoy home">
              <img src="/theme/images/envoy-logo.svg" alt="Envoy" />
            </a>
            <nav class="envoy-docs-banner__nav"><ul></ul></nav>
            <div class="envoy-docs-banner__actions">
              <a class="envoy-docs-banner__icon envoy-docs-banner__icon--github"
                 href="https://github.com/envoyproxy/envoy"
                 target="_blank" rel="noopener noreferrer"
                 aria-label="Envoy on GitHub (opens in a new tab)"
                 title="Envoy on GitHub">
                <span class="envoy-docs-banner__icon-glyph" aria-hidden="true"></span>
              </a>
            </div>
          </div>
        `;
        banner.querySelector(".envoy-docs-banner__actions")?.prepend(versionMenu);
      }

      const navRoot = banner?.querySelector(".envoy-docs-banner__nav ul");
      if (navRoot) {
        for (const link of versions.nav || []) {
          const li = document.createElement("li");
          const a = document.createElement("a");
          a.href = link.url;
          a.textContent = link.text;
          if (matchesNavPath(link.url)) {
            a.classList.add("is-active");
            a.setAttribute("aria-current", "page");
          }
          li.appendChild(a);
          navRoot.appendChild(li);
        }
      }

      const versionButton = versionMenu.querySelector(".envoy-docs-banner__version-button");
      const menu = versionMenu.querySelector(".envoy-docs-banner__menu");
      const search = versionMenu.querySelector(".envoy-docs-banner__search");
      const list = versionMenu.querySelector(".envoy-docs-banner__list");

      let isOpen = false;
      let activeIndex = 0;
      let visible = [];
      const featuredOptions = options.filter((option) => option.featured);
      const defaultVersion = hasCurrentVersion
        ? currentVersion
        : normalizeVersion(versions.latest_stable) || featuredOptions[0]?.version || options[0]?.version || "";
      const defaultFeaturedIndex = Math.max(0, featuredOptions.findIndex((option) => option.version === defaultVersion));

      const optionId = (version) => `envoy-docs-banner-option-${version.replaceAll(".", "-")}`;

      const computeVisible = () => {
        const query = search.value.trim().toLowerCase().replace(/^v/, "");
        if (!query) {
          return options.filter((option) => option.featured);
        }
        return options.filter((option) =>
          option.version.includes(query) ||
          (option.version === "latest" && "latest".includes(query)));
      };

      const renderList = () => {
        visible = computeVisible();
        if (activeIndex >= visible.length) {
          activeIndex = Math.max(0, visible.length - 1);
        }

        list.innerHTML = "";
        if (!visible.length) {
          const empty = document.createElement("li");
          empty.className = "envoy-docs-banner__empty";
          empty.textContent = "No matching versions";
          list.appendChild(empty);
          search.removeAttribute("aria-activedescendant");
          return;
        }

        visible.forEach((option, index) => {
          const item = document.createElement("li");
          item.role = "none";

          const link = document.createElement("a");
          link.href = buildVersionLink(option.version);
          link.role = "option";
          link.id = optionId(option.version);
          link.className = "envoy-docs-banner__item";
          link.tabIndex = -1;
          link.setAttribute("aria-selected", index === activeIndex ? "true" : "false");
          if (index === activeIndex) {
            link.classList.add("is-active");
          }
          if (hasCurrentVersion && option.version === currentVersion) {
            link.classList.add("is-current");
            link.setAttribute("aria-current", "page");
          }

          const label = document.createElement("span");
          label.textContent = displayName(option.version);

          const meta = document.createElement("span");
          meta.className = `envoy-docs-banner__item-meta envoy-docs-banner__item-meta--${option.state}`;
          meta.textContent = option.state;

          link.append(label, meta);
          link.addEventListener("mousemove", () => {
            if (activeIndex !== index) {
              activeIndex = index;
              renderList();
            }
          });
          link.addEventListener("click", (event) => {
            if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
              return; // let the browser open in a new tab etc.
            }
            closeMenu({ restoreFocus: false });
          });
          item.appendChild(link);
          list.appendChild(item);
        });

        search.setAttribute("aria-activedescendant", optionId(visible[activeIndex].version));
        list.querySelector(".is-active")?.scrollIntoView({ block: "nearest" });
      };

      const closeMenu = ({ restoreFocus = true } = {}) => {
        isOpen = false;
        search.value = "";
        activeIndex = 0;
        versionButton.setAttribute("aria-expanded", "false");
        menu.hidden = true;
        if (restoreFocus) {
          versionButton.focus();
        }
      };

      const openMenu = () => {
        isOpen = true;
        activeIndex = defaultFeaturedIndex;
        versionButton.setAttribute("aria-expanded", "true");
        menu.hidden = false;
        renderList();
        search.focus();
      };

      versionButton.addEventListener("click", () => {
        if (isOpen) {
          closeMenu();
        } else {
          openMenu();
        }
      }, { signal: controller.signal });

      search.addEventListener("input", () => {
        activeIndex = 0;
        renderList();
      }, { signal: controller.signal });

      // Keyboard handling lives on the input: the user is typing there.
      search.addEventListener("keydown", (event) => {
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
          event.preventDefault();
          if (!visible.length) return;
          const delta = event.key === "ArrowDown" ? 1 : -1;
          activeIndex = (activeIndex + delta + visible.length) % visible.length;
          renderList();
          return;
        }
        if (event.key === "Home" || event.key === "End") {
          event.preventDefault();
          activeIndex = event.key === "Home" ? 0 : Math.max(0, visible.length - 1);
          renderList();
          return;
        }
        if (event.key === "Enter") {
          event.preventDefault();
          const selected = visible[activeIndex];
          if (selected) {
            closeMenu({ restoreFocus: false });
            location.assign(buildVersionLink(selected.version));
          }
          return;
        }
        if (event.key === "Escape") {
          event.preventDefault();
          if (search.value) {
            search.value = "";
            activeIndex = 0;
            renderList();
          } else {
            closeMenu();
          }
        }
      }, { signal: controller.signal });

      document.addEventListener("click", (event) => {
        if (isOpen && event.target instanceof Node && !menu.contains(event.target) &&
            !versionButton.contains(event.target)) {
          closeMenu({ restoreFocus: false });
        }
      }, { signal: controller.signal });

      document.addEventListener("keydown", (event) => {
        if (
          !isOpen &&
          event.shiftKey &&
          event.key.toLowerCase() === OPEN_SHORTCUT.toLowerCase() &&
          !event.altKey && !event.ctrlKey && !event.metaKey &&
          !isEditableTarget(event.target)
        ) {
          event.preventDefault();
          openMenu();
          return;
        }
        if (isOpen && event.key === "Escape" && event.target !== search) {
          event.preventDefault();
          closeMenu();
        }
      }, { signal: controller.signal });

      cleanup();
      if (mountMode) {
        mountTarget.replaceChildren(versionMenu);
      } else {
        const hasTopbarShell = document.querySelector(".envoy-doc-topbar") !== null;
        document.body.classList.add("envoy-has-site-banner");
        document.body.classList.toggle("envoy-shell-topbar", hasTopbarShell);
        document.body.classList.toggle("envoy-shell-rtd", !hasTopbarShell);
        const mountPoint = document.getElementById("envoy-docs-banner") || banner;
        if (mountPoint === banner) {
          document.body.prepend(banner);
        } else {
          mountPoint.replaceWith(banner);
        }
      }
    })
    .catch(() => {});
})();
