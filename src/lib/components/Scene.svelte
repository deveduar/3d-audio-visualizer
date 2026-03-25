<script lang="ts">
    import { T } from '@threlte/core';
    import { OrbitControls } from '@threlte/extras';
    import WireframeSphere from './WireframeSphere.svelte';
</script>

<T.PerspectiveCamera makeDefault position={[0, 0, 80]} fov={60}>
    <OrbitControls enableZoom={false} enablePan={false} enableDamping />
</T.PerspectiveCamera>

<T.PointLight position={[10, 10, 10]} intensity={1} />
<T.PointLight position={[-10, -10, -10]} intensity={0.5} />

<WireframeSphere />
