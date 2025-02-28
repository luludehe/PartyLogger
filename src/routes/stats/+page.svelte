<script lang="ts">
	import type { PageData } from './$types'
	export let data: PageData
</script>

<section class="max-w-fit bg-gray-100">
	<div class="navbar w-screen bg-base-100 sticky top-0 z-50">
		<div class="navbar-start">
			<a class="btn btn-ghost text-xl">Suivi 01/03/2025</a>
		</div>
	</div>

	<div class="text-gray-700 body-font">
		<div class="container px-5 py-24 mx-auto">

			<div class="flex flex-wrap -m-4 text-center">
				<div class="p-4 w-1/2">
					<div class="border-2 border-gray-600 px-4 py-6 rounded-lg transform transition duration-500 hover:scale-110 items-center flex flex-col">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" class="fill-indigo-500 w-12 h-12 mb-3">
							<path d="M144 0a80 80 0 1 1 0 160A80 80 0 1 1 144 0zM512 0a80 80 0 1 1 0 160A80 80 0 1 1 512 0zM0 298.7C0 239.8 47.8 192 106.7 192l42.7 0c15.9 0 31 3.5 44.6 9.7c-1.3 7.2-1.9 14.7-1.9 22.3c0 38.2 16.8 72.5 43.3 96c-.2 0-.4 0-.7 0L21.3 320C9.6 320 0 310.4 0 298.7zM405.3 320c-.2 0-.4 0-.7 0c26.6-23.5 43.3-57.8 43.3-96c0-7.6-.7-15-1.9-22.3c13.6-6.3 28.7-9.7 44.6-9.7l42.7 0C592.2 192 640 239.8 640 298.7c0 11.8-9.6 21.3-21.3 21.3l-213.3 0zM224 224a96 96 0 1 1 192 0 96 96 0 1 1 -192 0zM128 485.3C128 411.7 187.7 352 261.3 352l117.3 0C452.3 352 512 411.7 512 485.3c0 14.7-11.9 26.7-26.7 26.7l-330.7 0c-14.7 0-26.7-11.9-26.7-26.7z"/>
						</svg>
						<h2 class="title-font font-medium text-3xl text-gray-900">{data.members}</h2>
						<p class="leading-relaxed">Adhérents</p>
					</div>
				</div>
				<div class="p-4 w-1/2">
					<div class="border-2 border-gray-600 px-4 py-6 rounded-lg transform transition duration-500 hover:scale-110 items-center flex flex-col">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" class="fill-indigo-500 w-12 h-12 mb-3">
							<path d="M144 0a80 80 0 1 1 0 160A80 80 0 1 1 144 0zM512 0a80 80 0 1 1 0 160A80 80 0 1 1 512 0zM0 298.7C0 239.8 47.8 192 106.7 192l42.7 0c15.9 0 31 3.5 44.6 9.7c-1.3 7.2-1.9 14.7-1.9 22.3c0 38.2 16.8 72.5 43.3 96c-.2 0-.4 0-.7 0L21.3 320C9.6 320 0 310.4 0 298.7zM405.3 320c-.2 0-.4 0-.7 0c26.6-23.5 43.3-57.8 43.3-96c0-7.6-.7-15-1.9-22.3c13.6-6.3 28.7-9.7 44.6-9.7l42.7 0C592.2 192 640 239.8 640 298.7c0 11.8-9.6 21.3-21.3 21.3l-213.3 0zM224 224a96 96 0 1 1 192 0 96 96 0 1 1 -192 0zM128 485.3C128 411.7 187.7 352 261.3 352l117.3 0C452.3 352 512 411.7 512 485.3c0 14.7-11.9 26.7-26.7 26.7l-330.7 0c-14.7 0-26.7-11.9-26.7-26.7z"/>
						</svg>
						<h2 class="title-font font-medium text-3xl text-gray-900">{data.notMembers}</h2>
						<p class="leading-relaxed">Non-adhérents</p>
					</div>
				</div>
				<div class="p-4 w-1/2">
					<div class="border-2 border-gray-600 px-4 py-6 rounded-lg transform transition duration-500 hover:scale-110 items-center flex flex-col">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" class="fill-indigo-500 w-12 h-12 mb-3">
								<path d="M144 0a80 80 0 1 1 0 160A80 80 0 1 1 144 0zM512 0a80 80 0 1 1 0 160A80 80 0 1 1 512 0zM0 298.7C0 239.8 47.8 192 106.7 192l42.7 0c15.9 0 31 3.5 44.6 9.7c-1.3 7.2-1.9 14.7-1.9 22.3c0 38.2 16.8 72.5 43.3 96c-.2 0-.4 0-.7 0L21.3 320C9.6 320 0 310.4 0 298.7zM405.3 320c-.2 0-.4 0-.7 0c26.6-23.5 43.3-57.8 43.3-96c0-7.6-.7-15-1.9-22.3c13.6-6.3 28.7-9.7 44.6-9.7l42.7 0C592.2 192 640 239.8 640 298.7c0 11.8-9.6 21.3-21.3 21.3l-213.3 0zM224 224a96 96 0 1 1 192 0 96 96 0 1 1 -192 0zM128 485.3C128 411.7 187.7 352 261.3 352l117.3 0C452.3 352 512 411.7 512 485.3c0 14.7-11.9 26.7-26.7 26.7l-330.7 0c-14.7 0-26.7-11.9-26.7-26.7z"/>
							</svg>
						<h2 class="title-font font-medium text-3xl text-gray-900">{data.guests}</h2>
						<p class="leading-relaxed">Invités</p>
					</div>
				</div>
				<div class="p-4 w-1/2">
					<div class="border-2 border-gray-600 px-4 py-6 rounded-lg transform transition duration-500 hover:scale-110 items-center flex flex-col">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" class="fill-indigo-500 w-12 h-12 mb-3">
							<path d="M64 0C28.7 0 0 28.7 0 64L0 448c0 35.3 28.7 64 64 64l256 0c35.3 0 64-28.7 64-64l0-384c0-35.3-28.7-64-64-64L64 0zM96 64l192 0c17.7 0 32 14.3 32 32l0 32c0 17.7-14.3 32-32 32L96 160c-17.7 0-32-14.3-32-32l0-32c0-17.7 14.3-32 32-32zm32 160a32 32 0 1 1 -64 0 32 32 0 1 1 64 0zM96 352a32 32 0 1 1 0-64 32 32 0 1 1 0 64zM64 416c0-17.7 14.3-32 32-32l96 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-96 0c-17.7 0-32-14.3-32-32zM192 256a32 32 0 1 1 0-64 32 32 0 1 1 0 64zm32 64a32 32 0 1 1 -64 0 32 32 0 1 1 64 0zm64-64a32 32 0 1 1 0-64 32 32 0 1 1 0 64zm32 64a32 32 0 1 1 -64 0 32 32 0 1 1 64 0zM288 448a32 32 0 1 1 0-64 32 32 0 1 1 0 64z"/>
						</svg>
						<h2 class="title-font font-medium text-3xl text-gray-900">{data.total}</h2>
						<p class="leading-relaxed">Total</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<style>
    section {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        /*flex: 0.6;*/
    }

    .navbar a {
        text-decoration: none;
    }

    h1 {
        width: 100%;
    }

</style>
