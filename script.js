async function updateStatus(id, newStatus) {
    console.log("Начинаем обновление статуса для ID:", id, "Статус:", newStatus);

    // 1. Если отклонили — просто меняем статус и выходим
    if (newStatus === 'rejected') {
        const { error } = await supabaseClient
            .from('applications')
            .update({ status: 'rejected' })
            .eq('id', id);
        
        if (error) return alert("Ошибка при отклонении: " + error.message);
        alert("Отклонено!");
        return loadApps();
    }

    // 2. Если одобрили — вытаскиваем полные данные заявки
    const { data: app, error: fetchError } = await supabaseClient
        .from('applications')
        .select('*')
        .eq('id', id)
        .single();

    if (fetchError || !app) {
        console.error("Ошибка получения заявки:", fetchError);
        return alert("Не удалось найти данные заявки в базе.");
    }

    try {
        console.log("Данные заявки получены:", app);

        // Переносим данные в таблицу citizens в зависимости от типа
        if (app.type === 'id' || app.type === 'license') {
            const fullName = app.data.full_name || app.data.full_name_roblox || "Не указано";
            
            const { error: citErr } = await supabaseClient.from('citizens').upsert({ 
                roblox_nick: app.username, 
                full_name: fullName,
                has_license: (app.type === 'license') // Если одобряем права, ставим true
            }, { onConflict: 'roblox_nick' });

            if (citErr) throw citErr;
        } 
        
        else if (app.type === 'car') {
            const carInfo = `${app.data.brand || app.data['Марка']} [${app.data.number || 'Б/Н'}]`;
            
            // Получаем текущие машины, чтобы не стереть их
            let { data: citizen } = await supabaseClient.from('citizens').select('car_data').eq('roblox_nick', app.username).single();
            let oldCars = (citizen && citizen.car_data && citizen.car_data !== 'Нет транспорта') ? citizen.car_data : "";
            let updatedCars = oldCars ? oldCars + ", " + carInfo : carInfo;

            const { error: carErr } = await supabaseClient.from('citizens').upsert({ 
                roblox_nick: app.username, 
                car_data: updatedCars 
            }, { onConflict: 'roblox_nick' });

            if (carErr) throw carErr;
        }

        // 3. САМЫЙ ВАЖНЫЙ МОМЕНТ: Меняем статус на 'approved' в таблице заявок
        const { error: finalUpdateErr } = await supabaseClient
            .from('applications')
            .update({ status: 'approved' }) // Убедись, что в базе это поле называется именно так
            .eq('id', id);

        if (finalUpdateErr) throw finalUpdateErr;

        alert("Успешно одобрено и занесено в базу МВД!");
        loadApps(); // Перезагружаем список заявок

    } catch (err) {
        console.error("Критическая ошибка при одобрении:", err);
        alert("Ошибка системы: " + (err.message || "проверьте консоль"));
    }
}
