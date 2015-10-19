// This is an example of a simple REST Api implementation.
//
// For debugging you can use "Advanced REST Client" for Google Chrome:
// https://chrome.google.com/webstore/detail/advanced-rest-client/hgmloofddffdnphfgcellkdfbfbjeloo

const users = new Map()
let id_counter = 0

api.get('/example/users', function()
{
	return Array.from(users.keys())
})

api.get('/example/user/:id', function({ id })
{
	if (!users.has(id))
	{
		throw new Errors.Not_found(`User ${id} not found`)
	}
	
	return { ...users.get(id), id: id }
})

api.post('/example/user', function({ name })
{
	if (!exists(name))
	{
		throw new Errors.Input_missing(`"name" not specified`)
	}

	id_counter++
	const id = String(id_counter)

	users.set(id, { name: name })

	return id
})

api.patch('/example/user/:id', function({ id, name })
{
	if (!users.has(id))
	{
		throw new Errors.Not_found(`User ${id} not found`)
	}

	users.get(id).name = name
})

api.delete('/example/user/:id', function({ id })
{
	if (!users.has(id))
	{
		throw new Errors.Not_found(`User ${id} not found`)
	}
	
	users.delete(id)
})