<!-- Content.svelte -->
<script>
    import { getContext } from 'svelte';
    import Surprise from './Surprise.svelte';

    const { open } = getContext('simple-modal');


    export function showSurprise() {
        open(Surprise, { message: "Error occured" });
    }
</script>

<p><button on:click={showSurprise}>Show me a surprise!</button></p>
