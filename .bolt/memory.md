# Project memory

## Product intent & audience

- Edvora Digital Store is a premium e-commerce platform for digital products.
- Core areas include customer portal, public catalog, shopping cart, admin dashboard, and Supabase-backed data.
- Primary audiences are digital-product customers, sellers, and administrators.
- The homepage should lead visitors from the value proposition to product discovery and brand exploration.

## Brand personality & voice

- Brand name: EDVORA.
- UI copy is generally in Brazilian Portuguese (pt-BR).
- Tone is premium, modern, clear, and trustworthy.
- Visual execution should feel production-ready rather than template-like.

## Visual design & UX direction

- Current stack uses Vite, React, Tailwind CSS, Lucide React, and the `@/` import alias.
- Preserve existing colors, typography, imagery, page designs, catalog behavior, authentication, checkout, and integrations when changing isolated UI behavior.
- Desktop navigation uses a fixed left sidebar with the EDVORA logo, vertically arranged icon-based options, labels beneath icons, rounded surfaces, subtle hover states, and a discreet active indicator. “Explorar produtos” is shortened to “Produtos”.
- Main content must remain offset from the fixed sidebar.
- Mobile navigation uses a fixed bottom bar for Início, Produtos, Favoritos, Carrinho, and Conta; the compact top menu remains available for categories, offers, and admin access.
- Prefer consistent Lucide icons, accessible controls, adequate touch targets, and visible keyboard focus.
- Homepage hero actions are “Explorar produtos” and “Conheça a EDVORA”.
- Homepage banners appear directly below the hero actions.
- Banner carousel supports arrows, pagination dots, pause behavior, and touch/swipe interaction. Transitions should feel fluid: eased slide movement, a subtle active-image zoom settling to its normal scale, and eager loading of banners to avoid visual jumps.
- Respect reduced-motion preferences; on mobile, animation is disabled when the user prefers less motion.
- Responsive spacing should be checked around hero content, banners, fixed navigation, and page content.
- Form UX includes loading states such as “Salvando...”, duplicate-submit prevention, and inline guidance when categories are unavailable.

## Decisions, constraints & rationale

- Navigation uses a Pinterest-inspired organizational pattern without adopting Pinterest branding: persistent left sidebar on desktop and bottom navigation on smaller screens.
- Navigation changes must preserve existing routes, links, and functionality; no catalog, database, authentication, checkout, or integration changes are intended.
- Supabase stores products, categories, newsletter subscribers, and product-cover images.
- Product management supports title, description, category, regular/promotional pricing, cover image, Kiwify/Cakto checkout links, checkout-platform selection, and status.
- Product operations treat zero affected rows as errors rather than false success.
- Cover-image naming avoids reliance on `crypto.randomUUID` for browser compatibility.
- Product forms remain usable when no categories exist and provide a shortcut to create one.
- Admins can manage catalog data; regular customers cannot write; published products are publicly readable.
- Save flow validates input, prevents duplicate submissions, shows progress, confirms the database write, then reports success and refreshes the list.
- Products and categories were cleared on request while database tables and newsletter subscribers were preserved.
- Categories should exist before products can be meaningfully assigned.
- Database CRUD, storage upload, and non-admin restrictions were tested transactionally.
- Carousel animation changes passed the build. Browser-level smoothness and reduced-motion behavior still need visual verification.

## Open questions & assumptions

- Test every navigation route, active state, fixed-position layout, nested route, refresh behavior, and desktop/tablet/mobile breakpoint in a browser.
- Verify that sidebar and bottom navigation do not overlap content, floating controls, product views, search, cart, favorites, or admin screens.
- Validate carousel slide timing, easing, preload behavior, arrow/dot controls, pause behavior, swipe interaction, and image rendering on real devices.
- Confirm keyboard focus visibility and touch-target accessibility across navigation and carousel controls.
- Supabase Storage policies are assumed to match the tested configuration; browser upload failures may require policy review.
- The public catalog remains empty until an administrator creates categories and products.
- Supabase project settings may still differ from the configuration used during API-level testing.