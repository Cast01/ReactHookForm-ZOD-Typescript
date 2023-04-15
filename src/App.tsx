import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form"
import { z } from "zod";
import { zodResolver } from '@hookform/resolvers/zod'
import { supabase } from "./lib/supabase";

function App() {
  const [outPut, setOutPut] = useState('');

  const createUserFormSchema = z.object({
    avatar: z.instanceof(FileList)
            .transform(list => list.item(0)!)
            .refine(file => file.size <= 5 * 1024 * 1024, 'O arquivo tem que ter no mínimo 5Mb'),
    name: z.string()
      .nonempty('O nome é obrigatório')
      .transform(name => {
        return name.trim().split(' ').map(word => {
          return word[0].toLocaleUpperCase().concat(word.substring(1))
        }).join(' ')
      })
    ,
    email: z.string()
      .nonempty('O e-mail é obrigatório')
      .email('Formato de e-mail inválido')
      .toLowerCase()
      .refine(email => {
        return email.endsWith('@cast.com.br')
      }, 'O e-mail precisa terminar com @cast.com.br'),
    password: z.string()
      .min(6, 'A senha precisa ter no mínimo 6 caracteres'),
    techs: z.array(z.object({
      title: z.string()
        .nonempty('Informe a tecnologia'),
      knowledge: z.coerce.number()
        .min(1)
        .max(100),
    })).min(2, 'Tem que ter no mínimo 2 tecnologias')
  })

  type createUserFormData = z.infer<typeof createUserFormSchema>

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<createUserFormData>({
    resolver: zodResolver(createUserFormSchema)
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'techs',
  })

  async function createUser(data: createUserFormData) {
    console.log(data.avatar)

    await supabase.storage.from('react-form').upload(data.avatar.name, data.avatar)

    setOutPut(JSON.stringify(data, null, 2))
  }

  function addNewTech() {
    append({
      title: '',
      knowledge: 1,
    })
  }

  return (
    <div
      className="bg-zinc-800 min-h-screen flex flex-col items-center justify-center text-white"
    >
      <form
        onSubmit={handleSubmit(createUser)}
        className="max-w-xs flex flex-col bg-white/10 p-6 rounded-lg"
      >
        <div>
          <label
            htmlFor="avatar"
          >
            Avatar:
          </label>
          <input
            type="file"
            
            id="avatar"
            // className="bg-zinc-800 w-full"
            {
            ...register('avatar')
            }
          />
          {
            errors.avatar && <span className="block text-red-500">{errors.avatar.message}</span>
          }
        </div>

        <div className="mt-4">
          <label
            htmlFor="name"
          >
            Nome:
          </label>
          <input
            type="name"
            id="name"
            className="bg-zinc-800 w-full"
            {
            ...register('name')
            }
          />
          {
            errors.name && <span className="block text-red-500">{errors.name.message}</span>
          }
        </div>

        <div className="mt-7">
          <label htmlFor="email">E-mail:</label>
          <input
            type="email"
            id="email"
            className="bg-zinc-800 w-full"
            {
            ...register('email')
            }
          />
          {
            errors.email && <span className="block text-red-500">{errors.email.message}</span>
          }
        </div>

        <div className="mt-7">
          <label
            htmlFor="password"
          >
            Password:
          </label>
          <input
            type="password"
            id="password"
            className="bg-zinc-800 w-full"
            {
            ...register('password')
            }
          />
          {
            errors.password && <span className="block text-red-500">{errors.password.message}</span>
          }
        </div>

        <div className="mt-7">
          <label
            htmlFor=""
            className="flex justify-between items-center"
          >
            Tecnologias:
            <button
              onClick={addNewTech}
              type={"button"}
              className="bg-blue-600 rounded-md px-4 py-2"
            >
              Adicionar
            </button>
          </label>
          <div className="flex flex-col gap-3 mt-4">
            {
              fields.map((field, index) => {
                return (
                  <div key={field.id} className="flex gap-3">
                    <div className="w-[80%]">
                      <input
                        type="text"
                        id="tech"
                        className="bg-zinc-800 w-full"
                        {
                        ...register(`techs.${index}.title`)
                        }
                      />
                      {
                        errors.techs?.[index]?.title && <span className="block text-red-500">{errors.techs?.[index]?.title?.message}</span>
                      }
                    </div>

                    <div className="w-[20%]">
                      <input
                        type="number"
                        id="knowledge"
                        className="bg-zinc-800 w-full"
                        {
                        ...register(`techs.${index}.knowledge`)
                        }
                      />
                      {
                        errors.techs?.[index]?.knowledge && <span className="block text-red-500">{errors.techs?.[index]?.knowledge?.message}</span>
                      }
                    </div>
                  </div>
                )
              })
            }
          </div>
          {
            errors.techs && <span className="block text-red-500">{errors.techs.message}</span>
          }
        </div>

        <button
          type="submit"
          className="mt-7 bg-green-700 rounded-lg py-3"
        >
          Enviar
        </button>
      </form>

      <pre>{outPut}</pre>
    </div>
  )
}

export default App
