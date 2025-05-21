<script lang="ts">
	import { API } from '$lib/api'
	import { Modal, ModalBody, ModalFooter, Button, FormInput, ButtonGroup, Label } from 'yesvelte'
	import { type IFrontendReceiverParameters, iFrontendReceiverParametersSchema } from '../Schemas'
	import { onMount } from 'svelte'
	export let show = false
	const model: IFrontendReceiverParameters = {
		name: '',
		protocol: 'SIA-DCS',
		port: 8080, //! this should be automatically set
		response: '/t',
		encryption_key: '',
		db_batch_interval: 5,
		crm_url: 'https://myCRM.com',
		crm_port: 8888,
		crm_send_retries: 3,
		max_clients: 100,
		polling_code: '603'
	}
	let values = model
	let errors = {}
	let protocols = ['SIA-DCS', 'ContactID']
	let batch_intervals = [1, 5, 10]
	let number_of_retries = [1, 2, 3]
	let max_clients = [10, 50, 100]

	async function CreateReceiver() {
		localStorage.setItem('createReceiver', JSON.stringify(values))
		if (typeof values.port === 'string') values.port = parseInt(values.port)
		if (typeof values.crm_port === 'string') values.crm_port = parseInt(values.crm_port)
		if (typeof values.crm_send_retries === 'string')
			values.crm_send_retries = parseInt(values.crm_send_retries)
		if (typeof values.max_clients === 'string') values.max_clients = parseInt(values.max_clients)
		if (typeof values.db_batch_interval === 'string')
			values.db_batch_interval = parseInt(values.db_batch_interval)
		if (iFrontendReceiverParametersSchema.safeParse(values).success) {
			try {
				await API.Receiver.Create(values)
				show = false
				values = model
			} catch (e) {
				console.log(e)
			}
		}
		else {
			errors = iFrontendReceiverParametersSchema.safeParse(values).error.format()
		}
	}
	onMount(() => {
		const receiver_data = localStorage.getItem('createReceiver')
		if (receiver_data) values = JSON.parse(receiver_data)
	})
</script>

<Modal scrollable class="border-none" title="Create a new device" placement="center" bind:show>
	<ModalBody class="overflow-y-auto border-none">
		<FormInput
			required
			bind:value={values.name}
			label="Name"
			name="name"
			state={errors.name? 'invalid' : ''}
			hint={errors.name?._errors}
			type="text"
			placeholder="My receiver name"
		/>
		<Label>Protocol</Label>
		<ButtonGroup class="flex mb-3">
			{#each protocols as protocol}
				<Button
					class="grow"
					active={values.protocol === protocol}
					on:click={() => (values.protocol = protocol)}
				>
					{protocol}
				</Button>
			{/each}
		</ButtonGroup>
		<FormInput
			label="Port"
			required
			bind:value={values.port}
			name="port"
			type="text"
			state={errors.port? 'invalid' : ''}
			hint={errors.port?._errors}
			placeholder="8989"
			min="8000"
			max="8999"
		/>
		<FormInput
			label="Receiver response"
			bind:value={values.response}
			required
			state={errors.response? 'invalid' : ''}
			hint={errors.response?._errors}
			placeholder="Receiver response"
			name="response"
			type="text"
		/>
		<FormInput
			required
			bind:value={values.encryption_key}
			label="Encryption key"
			name="encryption_key"
			state={errors.encryption_key? 'invalid' : ''}
			hint={errors.encryption_key?._errors}
			type="text"
			placeholder="Message encryption key"
		/>
		<Label>Batch interval</Label>
		<ButtonGroup class="flex mb-3">
			{#each batch_intervals as interval}
				<Button
					class="grow"
					active={values.db_batch_interval === interval}
					on:click={() => (values.db_batch_interval = interval)}
				>
					{interval}
				</Button>
			{/each}
		</ButtonGroup>
		<!-- !fix the db_batch_interval to be the only parameter needed -->

		<FormInput
			label="Crm url"
			required
			name="crm_url"
			type="text"
			placeholder="url"
			bind:value={values.crm_url}
			state={errors.crm_url? 'invalid' : ''}
			hint={errors.crm_url?._errors}
		/>
		<FormInput
			label="Crm port"
			required
			bind:value={values.crm_port}
			name="crm_port"
			type="text"
			state={errors.crm_port? 'invalid' : ''}
			hint={errors.crm_port?._errors}
			placeholder="8990"
			min="1"
			max="65535"
		/>
		<Label>Crm contact retries</Label>
		<ButtonGroup class="flex mb-3">
			{#each number_of_retries as retries}
				<Button
					class="grow"
					active={values.crm_send_retries === retries}
					on:click={() => (values.crm_send_retries = retries)}
				>
					{retries}
				</Button>
			{/each}
		</ButtonGroup>
		<Label>Number of imcoming clients</Label>
		<ButtonGroup class="flex mb-3">
			{#each max_clients as clients}
				<Button
					class="grow"
					active={values.max_clients === clients}
					on:click={() => (values.max_clients = clients)}
				>
					{clients}
				</Button>
			{/each}
		</ButtonGroup>
		<FormInput
			label="Polling code"
			bind:value={values.polling_code}
			required
			name="polling_code"
			state={errors.polling_code? 'invalid' : ''}
			hint={errors.polling_code?._errors}
			placeholder="Polling code"
			type="text"
		/>
	</ModalBody>
	<ModalFooter>
		<Button color="danger" class="w-24" on:click={() => (show = false)}>Cancel</Button>
		<Button color="success" class="w-24" type="submit" on:click={CreateReceiver}>Save</Button>
	</ModalFooter>
</Modal>
