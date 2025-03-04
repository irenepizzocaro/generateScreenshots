cmake_minimum_required(VERSION 3.10)
project(GenerateScreenshotsLib)

set(CMAKE_CXX_STANDARD 11)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

if(NOT CMAKE_BUILD_TYPE)
    set(CMAKE_BUILD_TYPE Release CACHE STRING "Build type" FORCE)
endif()

add_subdirectory(include/glfw)

set(GLM_INCLUDE_DIR "${CMAKE_CURRENT_SOURCE_DIR}/include/glm")

add_library(glad STATIC include/glad.c)
target_include_directories(glad PUBLIC ${CMAKE_CURRENT_SOURCE_DIR}/include)

find_package(OpenGL REQUIRED)

set(SOURCES
        generateSceenshots.cpp
        generateScreenshots.h
)
add_library(GenerateScreenshotsLib STATIC ${SOURCES})

target_link_libraries(GenerateScreenshotsLib PUBLIC glad glfw OpenGL::GL)
target_include_directories(GenerateScreenshotsLib PRIVATE ${GLM_INCLUDE_DIR})

message("Configuring for Release build with extreme optimizations")
target_compile_options(GenerateScreenshotsLib PRIVATE
        -O3
        -march=native
        -flto
        -ffast-math
        -funroll-loops
)