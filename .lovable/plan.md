

## Elegant Fade-and-Drift Coin Exit

Replace the current spiral drain with a refined **fade-and-drift** transition -- each coin gently floats outward from the ring while fading to transparent and slightly blurring. This creates a calm, polished dissolve effect commonly seen in premium product websites.

### How It Works

1. **Trigger**: User clicks "Explore Marketplace"
2. **Phase 1 - Slow Down (0-0.3s)**: The ring decelerates smoothly to near-zero speed, creating a "freeze" moment
3. **Phase 2 - Scatter and Fade (0.2-1.0s)**: Each coin drifts outward along its radial direction (away from center) while simultaneously fading out via opacity and scaling down slightly (to ~0.6). A gentle upward float is added for weightlessness
4. **Phase 3 - Complete (0.9-1.0s)**: All coins are invisible; dispatch `scene-converge-complete`

### Visual Qualities
- Feels like particles dissolving into air -- elegant and weightless
- The momentary pause before scatter creates anticipation
- Each coin moves along its own unique radial path, so they spread naturally
- No harsh movements or sudden drops -- everything is smooth and continuous
- Professional, Apple-style product transition feel

### Technical Details

**File: `src/components/Scene3D.tsx`**

**Constants:**
- Change `DRAIN_DURATION` to `EXIT_DURATION = 1.0`
- Remove `easeInCubic` and `easeInQuad`
- Add `easeOutCubic = (t) => 1 - Math.pow(1 - t, 3)` for smooth deceleration
- Add `easeInOutQuad = (t) => t < 0.5 ? 2*t*t : 1 - Math.pow(-2*t + 2, 2) / 2`

**Material changes for fade:**
- When `onConverge` fires, iterate all coin meshes and set every material's `transparent = true` (needed for opacity animation)
- During the exit loop, traverse each coin mesh and set `material.opacity` to `1 - easeOutCubic(progress)`

**Animation loop (replaces the `if (flyoutActive)` block):**
1. Calculate `progress = elapsed / EXIT_DURATION`
2. **Deceleration phase** (progress 0-0.3): Lerp `targetSpeed` from current toward 0.1
3. **Drift phase** (progress 0.2-1.0):
   - For each coin, compute drift distance: `200 * easeOutCubic(driftProgress)` along its radial direction (outward from ring center)
   - Add a gentle upward float: `+50 * easeOutCubic(driftProgress)` on the Z axis
   - Scale each coin: `1 - 0.4 * easeOutCubic(driftProgress)` (shrinks to 0.6)
   - Fade opacity: set all materials on each coin mesh to `1 - easeOutCubic(driftProgress)`
4. At progress >= 1: hide ringGroup, dispatch event

**`onConverge` handler:**
- Set `flyoutActive = true`, capture `flyoutStartTime`
- Set `targetSpeed = 0.1` (decelerate)
- For each coin, snapshot its current angle as `exitAngle` and set all materials to `transparent: true`
- Store `exitAngles` array

**`resetToRing` function:**
- Reset all material opacities back to 1 and `transparent = false`
- Reset positions, scales, angles as before

**New state variables:**
- `exitAngles: number[]` -- each coin's angle at the moment of trigger (determines drift direction)

