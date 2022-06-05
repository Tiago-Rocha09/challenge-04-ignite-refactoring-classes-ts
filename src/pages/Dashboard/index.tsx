import {useEffect, useState} from 'react'

import Header from '../../components/Header';
import api from '../../services/api';
import Food from '../../components/Food';
import ModalAddFood from '../../components/ModalAddFood';
import ModalEditFood from '../../components/ModalEditFood';
import { FoodsContainer } from './styles';
import { Food as IFood } from '../../types/foods';

type NewFoodData = Omit<IFood, 'id'>

function Dashboard () {

  const [foods, setFoods] = useState<IFood[]>([])
  const [editingFood, setEditingFood] = useState<IFood>({} as IFood)
  const [modalOpen, setModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)

  useEffect(() => {
    async function loadFoods() {
      const response = await api.get('/foods')
      setFoods(response.data)
    }
    loadFoods()
  }, [])

  async function handleAddFood(food:NewFoodData){
    const currentFoods = [...foods]

    try {
      const response = await api.post('/foods', {
        ...food,
        available: true,
      });
      setFoods([...currentFoods, response.data])
    } catch (err) {
      console.log(err);
    }
  }

  async function handleUpdateFood(food:IFood){
    const currentFoods = [...foods]
    const currentEditingFood = {...editingFood}

    try {
      const foodUpdated = await api.put(
        `/foods/${currentEditingFood.id}`,
        { ...currentEditingFood, ...food },
      );

      const foodsUpdated = currentFoods.map(f =>
        f.id !== foodUpdated.data.id ? f : foodUpdated.data,
      );

      setFoods(foodsUpdated)
    } catch (err) {
      console.log(err);
    }
  }

  async function handleDeleteFood(id:number){
    const currentFoods = [...foods]

    await api.delete(`/foods/${id}`);

    const foodsFiltered = currentFoods.filter(food => food.id !== id);

    setFoods(foodsFiltered)
  }

  function toggleModal(){
    setModalOpen(!modalOpen)
  }

  function toggleEditModal(){
    setEditModalOpen(!editModalOpen)
  }

  function handleEditFood(food:IFood){
    setEditingFood(food)
    setEditModalOpen(true)
  }

    return (
      <>
        <Header openModal={toggleModal} />
        <ModalAddFood
          isOpen={modalOpen}
          setIsOpen={toggleModal}
          handleAddFood={handleAddFood}
        />
        <ModalEditFood
          isOpen={editModalOpen}
          setIsOpen={toggleEditModal}
          editingFood={editingFood}
          handleUpdateFood={handleUpdateFood}
        />

        <FoodsContainer data-testid="foods-list">
          {foods &&
            foods.map(food => (
              <Food
                key={food.id}
                food={food}
                handleDelete={handleDeleteFood}
                handleEditFood={handleEditFood}
              />
            ))}
        </FoodsContainer>
      </>
    );
};

export default Dashboard;
