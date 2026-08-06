/**
 * Gallery entry point — `@paolojulian.dev/design-system/gallery`.
 *
 * Split out from the main entry because everything here depends on
 * `yet-another-react-lightbox`, an optional peer dependency. Keeping it behind
 * its own entry means importing the package normally costs nothing extra and
 * builds fine without the peer installed; only code that reaches for this path
 * needs it.
 *
 * The photo and video types are re-exported so a consumer wiring up a viewer
 * does not have to import from two entries to describe one photo.
 */
export {
  PPhotoLightbox,
  type PPhotoLightboxLabels,
  type PPhotoLightboxProps,
} from '../components/PPhotoLightbox';
export type { PPhoto, PVideo } from '../components/media';
